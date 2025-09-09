import { setTimeout as delay } from "node:timers/promises"
import { expect } from "chai"
import { runWatcher, waitFor,clearHistoryFileContents, initWatcherTestCollection, startApi, startAuth, startDb, stopProcesses, initNetwork, runWatcherPromise } from "./lib.js"
import path, { resolve as pathResolve } from 'node:path'
import fs from 'fs'
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
  addExisting: true,
}

describe("One shot Mode, Single Ckl file processing.", async function () {
  this.timeout(180_000)
  let db, auth, api
  let watcher
  let apiBase
 
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
  //  watcher = await runWatcher({ entry: "index.js", env, consoleLog: true  })
  })
  

  after(async () => {
    stopProcesses([api, auth, db])
  })

  it("should log the correct startup messag with config etc. ", async () => {
//    await waitFor(() => watcher.logRecords.some(r => r.message === `running`), 10000)

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
      // apiBase is computed in the before() hook; use that value
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
   // await waitFor(() => watcher.logRecords.some(r => r.message === `preflight token request succeeded`), 10000)
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
//    await waitFor(() => watcher.logRecords.some(r => r.message === `preflight api requests succeeded`), 10000)
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
    //await waitFor(() => watcher.logRecords.some(r => r.message === `history file is writable, periodic writes enabled`), 10000)
    expect(watcher.logRecords.some(r => r.message === `history file is writable, periodic writes enabled`)).to.be.true
    const initLog = watcher.logRecords.find(r => r.message === `history initialized from file`)
    expect(initLog.file).to.equal(env.historyFile)
    // read file to confirm it is empty
  })

  it("It should start a scan of and process the single ckl file present in the test/e2e/testFiles folder", async () => {
   // await waitFor(() => watcher.logRecords.some(r => r.message === `scan ended`), 60000)
    
    const expectedLogMessages = [
      {
        message: `scan started`,
        path: env.path
      },
      {
        message: "queued for parsing",
        file: env.path + "/ABCPRODSQL.ckl"
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
    //await waitFor(() => watcher.logRecords.some(r => r.message === `results queued`), 20000)
    expect(watcher.logRecords.some(r => r.message === `results queued`)).to.be.true
    const resultLog = watcher.logRecords.find(r => r.message === `results queued`)
    expect(resultLog.target).to.equal("ABCPRODSQL")
    expect(resultLog.file).to.equal(env.path + "/ABCPRODSQL.ckl")
    expect(resultLog.checklists).to.exist
  })

  it("should start a cargo queue batch of id 1 and size 1", async () => {
    //await waitFor(() => watcher.logRecords.some(r => r.message === `batch started`), 20000)
    expect(watcher.logRecords.some(r => r.message === `batch started`)).to.be.true
    const batchLog = watcher.logRecords.find(r => r.message === `batch started`)
    expect(batchLog.batchId).to.equal(1)
    expect(batchLog.size).to.equal(1)
  })

  
  it("should request assets and stigs for the destination collection", async () => {
  // await waitFor(() => watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'asset data received'), 10000)
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
   // await waitFor(() => watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'asset created'), 10000)
    const created = watcher.logRecords.find(r => r.component === 'cargo' && r.message === 'asset created')
    expect(created).to.exist
    expect(created.asset).to.exist
    // basic sanity checks on asset structure
    expect(created.asset.name).to.include('ABCPRODSQL')
    expect(created.asset.collection && created.asset.collection.collectionId).to.equal(env.collectionId)

    // warn no reviews to post
    expect(watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'no reviews to post')).to.be.true
  })

  it("should add the CKL file to history and write the history file", async () => {
   // await waitFor(() => watcher.logRecords.some(r => r.component === 'scan' && r.message === 'added to history'), 10000)
    const added = watcher.logRecords.find(r => r.component === 'scan' && r.message === 'added to history')
    expect(added).to.exist
    expect(Array.isArray(added.file)).to.be.true
    expect(added.file.some(f => f.endsWith('ABCPRODSQL.ckl'))).to.be.true

    // history file overwritten with memory
    //await waitFor(() => watcher.logRecords.some(r => r.component === 'scan' && r.message === 'history file overwritten with history data from memory'), 10000)
    const overwritten = watcher.logRecords.find(r => r.component === 'scan' && r.message === 'history file overwritten with history data from memory')
    expect(overwritten).to.exist
    expect(overwritten.file).to.equal(env.historyFile)

    // read history file to confirm it has the one entry
    const fileContents = fs.readFileSync(env.historyFile, 'utf8')
    const lines = fileContents.split('\n').filter(l => l.trim().length > 0)
    expect(lines.length).to.equal(1)
    const entry = JSON.parse(lines[0])
    expect(entry.file).to.equal(pathResolve(process.cwd(), 'test/e2e/testFiles/ABCPRODSQL.ckl'))
    expect(entry.mtime).to.exist
    expect(entry.size).to.exist
    expect(entry.checksum).to.exist
  })

  it("should finish the batch, finish one-shot mode and shut down with code 0", async () => {
   // await waitFor(() => watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'batch ended'), 10000)
    expect(watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'batch ended')).to.be.true
    expect(watcher.logRecords.some(r => r.component === 'cargo' && r.message === 'finished one shot mode')).to.be.true

    // final shutdown log
    //await waitFor(() => watcher.logRecords.some(r => r.component === 'index' && /shutdown event with code 0/i.test(r.message)), 10000)
    expect(watcher.logRecords.some(r => r.component === 'index' && /shutdown event with code 0/i.test(r.message))).to.be.true
  })

  
})
