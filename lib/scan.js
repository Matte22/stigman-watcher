const fg = require('fast-glob')
const config = require('./args')
const { logger } = require('./logger')
const fs = require('fs')
const parse = require('./parse')
const { serializeError } = require('serialize-error')
const historyManager = require('./historyManager')
const component = 'scan'


function setUpHistory(config) {
  historyManager.loadHistoryFromFile(config.historyFile);
}

let historyStream
if (config.historyFile) {
  historyStream = fs.createWriteStream(config.historyFile, { flags: 'a' });
}

async function startScanner (config) {
  let currentFilesSet = new Set()

  try {
    const stream = fg.stream([`${config.path}/**/*.ckl`, `${config.path}/**/*.xml`,`${config.path}/**/*.cklb` ], { 
      dot: !config.ignoreDot,
      suppressErrors: true,
      ignore: config.ignoreGlob ?? []
    })
    logger.info({component: component, message: `scan started`, path: config.path})

    for await (const entry of stream) {
      logger.verbose({component: component, message: `discovered file`, file: entry})
      if (history.has(entry)) {
        logger.verbose({component: component, message: `history match`, file: entry})
      }
      else {
        history.add(entry)
        logger.verbose({component: component, message: `history add`, file: entry})
        if (config.historyFile) _writeHistory(entry)
        parse.queue.push(entry)
        logger.info({component: component, message: `queued for parsing`, file: entry})
      }
    }
    logger.info({component: component, message: `scan ended`, path: config.path})
  }
  catch(e) {
    logger.error({component: component, error: serializeError(e)})
  }
  finally {
    if (!config.oneShot){
    scheduleNextScan(config)
    }
    else{
      logger.info({component: component, message: `one-shot scan completed`, path: config.path})
    }
  }
  
  
}

async function _writeHistory (entry) {
  try {
    historyStream.write(`${entry}\n`)
  }
  catch (e) {
    logger.error({
      component: component,
      error: serializeError(e)
    })
  }
}

function scheduleNextScan (config) {

  
  setTimeout(() => startScanner(config), config.scanInterval); 
  logger.info({ 
    component: component, 
    message: `scan scheduled`, 
    path: config.path,
    delay: config.scanInterval 
  })
}

module.exports = { startScanner, scheduleNextScan }
