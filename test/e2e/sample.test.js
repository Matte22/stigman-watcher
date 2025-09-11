import { setTimeout as delay } from "node:timers/promises"
import { expect } from "chai"
import { runWatcher, uploadTestStig, clearDirectory, createCkl, waitFor,clearHistoryFileContents, initWatcherTestCollection, startApi, startAuth, startDb, stopProcesses, initNetwork, runWatcherPromise } from "./lib.js"
import path, { resolve as pathResolve } from 'node:path'
import fs from 'fs'

const BASE_CKL_PATH = "test/e2e/testFiles/test.ckl"

describe("One shot Mode Scan mode, Single Ckl file processing.", async function () {
  this.timeout(180_000)
  let db, auth, api
  let watcher
  let apiBase

  const env = {
    apiBase: "http://api:54001/api",
    authority: `http://localhost:8080`,
    collectionId: "1",
    clientId: "stigman-watcher",
    clientSecret: "954fd71a-dad6-47ab-8035-060268f3d396",
    path: "test/e2e/testFiles",
    oneShot: true,
    mode: "scan",
    historyFile: "test/e2e/e2e-history.txt",
    responseTimeout: 10000,
    historyWriteInterval: 10000,
    scanInterval: 60000,
    cargoDelay: 7000,
    logLevel: "verbose",
    cargoSize: 15,
  }
 
  before(async () => {
    await clearHistoryFileContents(env.historyFile)
    await initNetwork()
    db = await startDb()
    auth = await startAuth()
    env.authority = `http://localhost:${auth.port}`
    api = await startApi()
    const apiHost = api.getHost()
    const apiPort = api.getMappedPort(54000)
    apiBase = `http://${apiHost}:${apiPort}/api`
    env.apiBase = apiBase
    const { user, collection } = await initWatcherTestCollection()
    env.collectionId = collection.collectionId
    watcher = await runWatcherPromise({ entry: "index.js", env, consoleLog: true, resolveOnMessage: `received shutdown event with code 0, exiting`})
  })
  

  after(async () => {
    stopProcesses([api, auth, db])
  })

  it("should log the correct startup messag with config etc. ", async () => {

    expect(watcher.logRecords.some(r => r.message === `running`)).to.be.true
    const expectedOptions = {
      path: env.path,
      collectionId: env.collectionId,
      silent: false,
      prompt: true,
      logLevel: 'verbose',
      logFileLevel: 'verbose',
      mode: env.mode,
      historyFile: env.historyFile,
      logFile: false,
      api: env.apiBase,
      authority: env.authority,
      clientId: env.clientId,
      scopePrefix: '',
      addExisting: true,
      cargoDelay: env.cargoDelay,
      historyWriteInterval: env.historyWriteInterval,
      cargoSize: env.cargoSize,
      createObjects: true,
      eventPolling: true,
      stabilityThreshold: 0,
      oneShot: env.oneShot,
      logColor: false,
      debug: false,
      scanInterval: env.scanInterval,
      ignoreDot: true,
      strictRevisionCheck: false,
      responseTimeout: env.responseTimeout,
      version: '1.5.4',
      _originalPath: env.path,
      _resolvedPath: pathResolve(process.cwd(), env.path),
      clientSecret: '[hidden]'
    }

    expect(watcher.logRecords.find(r => r.message === `running`).options).to.include(expectedOptions)
  })

  it("should complete preflight token process sucessfully", async () => {
    expect(watcher.logRecords.some(r => r.message === `preflight token request succeeded`)).to.be.true

    const expectedOidcRequest = {
      request: {
        method: 'GET',
        url: env.authority + '/.well-known/openid-configuration',
      },
      response: {
        status: 200,
        body: {
          issuer: env.authority,
          authorization_endpoint: env.authority + '/authorize',
          token_endpoint: env.authority + '/token',
          jwks_uri: env.authority + '/.well-known/jwks.json',
          end_session_endpoint: env.authority + '/logout',
          code_challenge_methods_supported: ['S256'],
          access_token: true,
          id_token: true
        }
      }
    }
    expect(watcher.logRecords.find(r => r.message === `http response`).request).to.deep.equal(expectedOidcRequest.request)
  })

  it("should Request for scap maps, the watched collection, stigs and the user", async () => {
    expect(watcher.logRecords.some(r => r.message === `preflight api requests succeeded`)).to.be.true

    const expectedRequestMethods = [
      {
        url: `${env.apiBase}/stigs/scap-maps`,
        response: 200
      },
      {
        url: `${env.apiBase}/collections/${env.collectionId}`,
        response: 200
      },
      {
        url: `${env.apiBase}/stigs`,
        response: 200
      },
      {
        url: `${env.apiBase}/user`,
        response: 200
      }
    ]

    const actualRequests = watcher.logRecords.filter(r => r.level === `http` && r.request.url.startsWith(env.apiBase))
    expect(actualRequests.length).to.be.at.least(expectedRequestMethods.length)

    expectedRequestMethods.forEach(expected => {
      const match = actualRequests.find(r => r.request.url === expected.url && r.response.status === expected.response)
      expect(match, `Expected request to ${expected.url} with response ${expected.response}`).to.exist
    })
  })

  it("should initalize a writable history file at path test/e2e/e2e-history.txt", async () => {
    expect(watcher.logRecords.some(r => r.message === `history file is writable, periodic writes enabled`)).to.be.true
    const initLog = watcher.logRecords.find(r => r.message === `history initialized from file`)
    expect(initLog.file).to.equal(env.historyFile)
  })

  it("It should start a scan of and process the single ckl file present in the test/e2e/testFiles folder", async () => {
    const expectedLogMessages = [
      {
        message: `scan started`,
        path: env.path
      },
      {
        message: "queued for parsing",
        file: env.path + "/test.ckl"
      },
      {
        message: "scan ended",
        path: env.path
      }]

    expectedLogMessages.forEach(expected => {
      const match = watcher.logRecords.find(r => r.message === expected.message && (expected.path ? r.path === expected.path : true) && (expected.file ? r.file === expected.file : true))
      expect(match, `Expected log message: ${expected.message} ${expected.path ? `with path ${expected.path}` : ''} ${expected.file ? `with file ${expected.file}` : ''}`).to.exist
    })
  })

  it("should log a parsed result from parser of the single ckl file", async () => {
    expect(watcher.logRecords.some(r => r.message === `results queued`)).to.be.true
    const resultLog = watcher.logRecords.find(r => r.message === `results queued`)
    expect(resultLog.target).to.equal("test")
    expect(resultLog.file).to.equal(env.path + "/test.ckl")
    expect(resultLog.checklists).to.exist
  })

  it("should start a cargo queue batch of id 1 and size 1", async () => {
    expect(watcher.logRecords.some(r => r.message === `batch started`)).to.be.true
    const batchLog = watcher.logRecords.find(r => r.message === `batch started`)
    expect(batchLog.batchId).to.equal(1)
    expect(batchLog.size).to.equal(1)
  })

  
  it("should request assets and stigs for the destination collection", async () => {
    const assetRequestLog = watcher.logRecords.find(r => r.request && r.request.url === `${env.apiBase}/assets?collectionId=1&projection=stigs`)
    expect(assetRequestLog).to.exist
    const assetDataLog = watcher.logRecords.find(r => r.component === 'cargo' && r.message === 'asset data received')
    expect(assetDataLog).to.exist
    expect(assetDataLog.size).to.equal(0)

    await waitFor(() => watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'stig data received'), 10000)
    expect(watcher.logRecords.some(r => r.component === 'api' && r.message === 'query' && r.request && r.request.url === `${env.apiBase}/stigs`)).to.be.true
    expect(watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'stig data received' && r.size === 0)).to.be.true
  })


  it("should create an asset and warn when there are no reviews to post", async () => {
    const created = watcher.logRecords.find(r => r.component === 'cargo' && r.message === 'asset created')
    expect(created).to.exist
    expect(created.asset).to.exist
    // basic sanity checks on asset structure
    expect(created.asset.name).to.include('test')
    expect(created.asset.collection && created.asset.collection.collectionId).to.equal(env.collectionId)

    // warn no reviews to post
    expect(watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'no reviews to post')).to.be.true
  })

  it("should add the CKL file to history and write the history file", async () => {
    const added = watcher.logRecords.find(r => r.component === 'scan' && r.message === 'added to history')
    expect(added).to.exist
    expect(Array.isArray(added.file)).to.be.true
    expect(added.file.some(f => f.endsWith('test.ckl'))).to.be.true

    // history file overwritten with memory
    const overwritten = watcher.logRecords.find(r => r.component === 'scan' && r.message === 'history file overwritten with history data from memory')
    expect(overwritten).to.exist
    expect(overwritten.file).to.equal(env.historyFile)

    // read history file to confirm it has the one entry
    const fileContents = fs.readFileSync(env.historyFile, 'utf8')
    const lines = fileContents.split('\n').filter(l => l.trim().length > 0)
    expect(lines.length).to.equal(1)
    const entry = lines[0]
    expect(entry).to.equal('test/e2e/testFiles/test.ckl')
  })

  it("should finish the batch, finish one-shot mode and shut down with code 0", async () => {
    expect(watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'batch ended')).to.be.true
    expect(watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'finished one shot mode')).to.be.true

    expect(watcher.logRecords.some(r => r.component === 'index' && /shutdown event with code 0/i.test(r.message))).to.be.true
  })
})

describe("One shot mode Scan, many files in nested structure with multiple batches", async function () {
  this.timeout(180_000)
  let db, auth, api
  let watcher
  let apiBase

  const env = {
    apiBase: "http://api:54001/api",
    authority: `http://localhost:8080`,
    collectionId: "1",
    clientId: "stigman-watcher",
    clientSecret: "954fd71a-dad6-47ab-8035-060268f3d396",
    path: "test/e2e/scrapFiles",
    oneShot: true,
    mode: "scan",
    historyFile: "test/e2e/e2e-history.txt",
    responseTimeout: 10000,
    historyWriteInterval: 10000,
    scanInterval: 60000,
    cargoDelay: 7000,
    logLevel: "verbose",
    cargoSize: 2,
  }
 
  before(async () => {
    await clearHistoryFileContents(env.historyFile)
    await initNetwork()
    db = await startDb()
    auth = await startAuth()
    env.authority = `http://localhost:${auth.port}`
    api = await startApi()
    const apiHost = api.getHost()
    const apiPort = api.getMappedPort(54000)
    apiBase = `http://${apiHost}:${apiPort}/api`
    env.apiBase = apiBase
    const { collection } = await initWatcherTestCollection()
    env.collectionId = collection.collectionId

    await uploadTestStig('VPN_STIG.xml')
    for (let i = 1; i <= 5; i++) {
      await createCkl(BASE_CKL_PATH, `test/e2e/scrapFiles/test${i}.ckl`, `test${i}`)
    }
    watcher = await runWatcherPromise({ entry: "index.js", env, consoleLog: true, resolveOnMessage: `received shutdown event with code 0, exiting`})
  })
  
  after(async () => {
    stopProcesses([api, auth, db])
    clearDirectory("test/e2e/scrapFiles")
  })

  it("Should log correct startup and config", async () => {
    const running = watcher.logRecords.find(r => r.message === 'running')
    expect(running).to.exist
    expect(running.options).to.include({
      path: env.path,
      oneShot: env.oneShot,
      cargoSize: env.cargoSize
    })
  })

  it("should run scan and detect 5 files in a non nested folder ", async () => {
    const queued = watcher.logRecords.filter(r => r.message === 'queued for parsing' && r.file && r.file.startsWith(env.path))
    expect(queued.length).to.equal(5)
    const fileNames = queued.map(q => q.file.split('/').pop())
    const expectedFileNames = ['test1.ckl','test2.ckl','test3.ckl','test4.ckl','test5.ckl']
    for (const fn of expectedFileNames) {
      expect(fileNames).to.include(fn)
    }
  })

  it("should add 5 task items to parsing queue", async () => {
    const queuedEvents = watcher.logRecords.filter(r => r.component === 'scan' && r.message === 'handling parseQueue event' && r.event === 'task_queued')
    expect(queuedEvents.length).to.be.at.least(5)
  })

  it("parse 5 items", async () => {
    const results = watcher.logRecords.filter(r => r.message === 'results queued')
    expect(results.length).to.be.at.least(5)
    const targets =  ['test1', 'test2', 'test3', 'test4', 'test5']
    for (const result of results) {
      expect(targets).to.include(result.target)
    }
    
  })

  it("should add 5 task items to cargo queue", async () => {
    const cargoQueued = watcher.logRecords.filter(r => r.component === 'scan' && r.message === 'handling cargoQueue event' && r.event === 'task_queued')
    expect(cargoQueued.length).to.be.at.least(5)
  })

  it("should run 3 batches of the cargo queue, 2 of 2 items and 1 of 1 item", async () => {
    const batches = watcher.logRecords.filter(r => r.component === 'cargo' && r.message === 'batch started')
    expect(batches.length).to.equal(3)
    const batchIds = [1, 2, 3]
    const possibleSizes = [1,2]
    const sizes = batches.map(b => b.size)
    for (const size of sizes) {
      expect(possibleSizes).to.include(size)
    }
    for (const id of batchIds) {
      expect(batches.some(b => b.batchId === id)).to.be.true
    }

    const ended = watcher.logRecords.filter(r => r.component === 'cargo' && r.message === 'batch ended')
    expect(ended.length).to.be.at.least(3)

    for(const id of batchIds) {
      expect(ended.some(e => e.batchId === id)).to.be.true
    }
  })

  it("should create 5 different assets", async () => {
    const created = watcher.logRecords.filter(r => r.component === 'cargo' && r.message === 'asset created' && r.asset && r.asset.name)
    expect(created.length).to.be.at.least(5)
    const names = created.map(c => c.asset.name)
    const expected = ['test1','test2','test3','test4','test5']
    for (const name of expected) {
      expect(names).to.include(name)
    }
  })

  it("should see asset data and stig data received for each batch", async () => {
     // gather batch ids that started
    const batchIds = watcher.logRecords.filter(r => r.component === 'cargo' && r.message === 'batch started').map(b => b.batchId)
    batchIds.forEach(id => {
      const a = watcher.logRecords.find(r => r.component === 'cargo' && r.message === 'asset data received' && r.batchId === id)
      const s = watcher.logRecords.find(r => r.component === 'cargo' && r.message === 'stig data received' && r.batchId === id)
      expect(a).to.exist
      expect(s).to.exist
    })
  })

  it("should write 5 entries to the history file", async () => {
    const added = watcher.logRecords.filter(r => r.component === 'scan' && r.message === 'added to history')
    expect(added.length).to.be.at.least(5)
    // collect file paths from the log entries
    const files = added.flatMap(a => Array.isArray(a.file) ? a.file : [a.file])
    const expectedFiles = ['test1.ckl','test2.ckl','test3.ckl','test4.ckl','test5.ckl']
    for (const fn of expectedFiles) {
      expect(files.some(f => f.endsWith(fn))).to.be.true
    }

    // check history file contents
    const fileContents = fs.readFileSync(env.historyFile, 'utf8')
    const lines = fileContents.split('\n').filter(l => l.trim().length > 0)
    expect(lines.length).to.equal(5)
    for (const fn of expectedFiles) {
      expect(lines.some(l => l.endsWith(fn))).to.be.true
    }

  })

  it("check shutdown message", async () => {
    expect(watcher.logRecords.some(r => r.component === 'index' && /shutdown event with code 0/i.test(r.message))).to.be.true
  })
})

describe("Scan Mode, Drop in a file while running", async function () {
    this.timeout(120_000)
  let db, auth, api
  let watcher
  const dropEnv = {
    apiBase: "http://api:54001/api",
    authority: `http://localhost:8080`,
    collectionId: "1",
    clientId: "stigman-watcher",
    clientSecret: "954fd71a-dad6-47ab-8035-060268f3d396",
    path: "test/e2e/dropFiles",
    oneShot: false,
    mode: "scan",
    historyFile: "test/e2e/e2e-history.txt",
    responseTimeout: 10000,
    historyWriteInterval: 10000,
    scanInterval: 60000,
    cargoDelay: 7000,
    logLevel: "verbose",
    cargoSize: 2,
  }

  before(async () => {
    await clearHistoryFileContents(dropEnv.historyFile)
    await initNetwork()
    db = await startDb()
    auth = await startAuth()
    dropEnv.authority = `http://localhost:${auth.port}`
    api = await startApi()
    const apiHost = api.getHost()
    const apiPort = api.getMappedPort(54000)
    dropEnv.apiBase = `http://${apiHost}:${apiPort}/api`
    const { collection } = await initWatcherTestCollection()
    dropEnv.collectionId = collection.collectionId
    clearDirectory(dropEnv.path)
    watcher = await runWatcher({ entry: 'index.js', env: dropEnv, consoleLog: true })
  })

  after(async () => {
    try {
      if (watcher && watcher.process) {
        watcher.process.kill()
      }
    } catch (e) {}
    stopProcesses([api, auth, db])
    clearDirectory(dropEnv.path)
  })

  it('starts running (non-promise watcher)', async () => {
    await waitFor(() => watcher.logRecords.some(r => r.message === 'running'), 1000000)
    expect(watcher.logRecords.some(r => r.message === 'running')).to.be.true
  })

  it('detects a dropped file after 10s and queues it for parsing', async () => {
    // wait a moment for watcher to stabilize then drop a file
    await delay(10000)
    await createCkl(BASE_CKL_PATH, `${dropEnv.path}/dropped.ckl`, 'dropped')
    await waitFor(() => watcher.logRecords.some(r => r.message === 'queued for parsing' && r.file && r.file.endsWith('dropped.ckl')), 200000)
    expect(watcher.logRecords.some(r => r.message === 'queued for parsing' && r.file && r.file.endsWith('dropped.ckl'))).to.be.true
  })

  it('parses and queues results for the dropped file', async () => {
    await waitFor(() => watcher.logRecords.some(r => r.message === 'results queued' && r.file && r.file.endsWith('dropped.ckl')), 200000)
    const res = watcher.logRecords.find(r => r.message === 'results queued' && r.file && r.file.endsWith('dropped.ckl'))
    expect(res).to.exist
    expect(res.target).to.equal('dropped')
  })

  it('processes the dropped file through cargo and adds to history', async () => {
    await waitFor(() => watcher.logRecords.some(r => r.component === 'scan' && r.message === 'added to history' && Array.isArray(r.file) && r.file.some(f => f.endsWith('dropped.ckl'))), 20000)
    expect(watcher.logRecords.some(r => r.component === 'scan' && r.message === 'added to history' && Array.isArray(r.file) && r.file.some(f => f.endsWith('dropped.ckl')))).to.be.true
  })
})

describe("Event Mode, Drop in a file while running", async function () {
})

describe("errors and edge cases", async function () {
})