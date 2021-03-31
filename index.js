const auth = require('./lib/auth')
const api = require('./lib/api')
const cargo = require('./lib/cargo')
const config = require('./config')
const chokidar = require('chokidar');
const fs = require('fs').promises
const parsers = require('./lib/parsers')
const Queue = require('better-queue')
require('log-timestamp')

const cargoQueue = new Queue(cargo.cklsHandler, {
  id: 'file',
  batchSize: config.cargoSize,
  batchDelay: config.cargoDelay,
  // batchDelayTimeout: config.cargoDelay
})
cargoQueue.on('batch_failed', (taskId, err, stats) => {
  console.log( `[QUEUE] ${taskId} : Fail : ${err.message} : ${JSON.stringify(stats)}`)
})

async function parseFile (file, cb) {
  const component = 'PARSE'
  try {
    console.log(`[${component}] ${file}`)
    const extension = file.substring(file.lastIndexOf(".") + 1)
    let parser, type
    if (extension.toLowerCase() === 'ckl') {
      parser = parsers.reviewsFromCkl
      type = 'CKL'
    }
    else if (extension.toLowerCase() === 'xml') {
      parser = parsers.reviewsFromScc
      type = "XCCDF"
    }
    else {
      console.log(`[${component}] ${file}: ignored unknown extension.`)
      return false
    }
    const data = await fs.readFile(file)
    let parseResult = parser(data)
    parseResult.file = file
    cargoQueue.push( parseResult )
    console.log(`[QUEUE] ${file}`)
  }
  catch (e) {
    console.log(`[${component}] ${file} ${e}`)
    cb( e, undefined)
  }
  finally {
    cb()
  }
}

const parseQueue = new Queue (parseFile, {
  concurrent: 3
})

async function run() {
  try {
    console.log(`[AUTH] Trying preflight`)
    const tokens = await auth.getTokens()
    console.log(`[AUTH] Preflight succeeded: Got OIDC token`)
    console.log(`[API] Trying preflight`)
    const assets = await api.getCollectionAssets(config.collectionId)
    console.log(`[API] Preflight succeeded: Got Assets in Collection ${config.collectionId}`)
    const stigs = await api.getInstalledStigs()
    console.log(`[API] Preflight succeeded: Got installed STIGs`)

    const watcher = chokidar.watch(config.watchDir, {
      ignored: /(^|[\/\\])\../,
      ignoreInitial: !config.addExisting,
      persistent: true
    })

    watcher.on('add', file  => {
      const extension = file.substring(file.lastIndexOf(".") + 1)
      if (extension.toLowerCase() === 'ckl') {
        console.log(`[ADDED] ${file}`)
        parseQueue.push( file )
      }
    })
    console.log(`[WATCHER] Watching ${config.watchDir}`)
  }
  catch (error) {
    console.log(`${error.component} ${error.message}`)
  }
}

run()

