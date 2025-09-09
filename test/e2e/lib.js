import path, { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, execSync } from 'node:child_process'
import EventEmitter from 'node:events'
import * as readline from 'node:readline'
import MockOidc from './mockOidc.js'
import fs from 'fs'
import {
  GenericContainer,
  Wait,
  Network,
  PullPolicy,
  TestContainers
} from 'testcontainers'
const nodeCmd = process.env.GITHUB_RUN_ID
  ? '/usr/local/bin/node'
  : process.execPath
const AUTH_PORT = 8080
let apiHost, apiPort
let dbPort 
let net
let auth

export const ADMIN_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJGSjg2R2NGM2pUYk5MT2NvNE52WmtVQ0lVbWZZQ3FvcXRPUWVNZmJoTmxFIn0.eyJleHAiOjE4NjQ2ODEwMzUsImlhdCI6MTY3MDU0MDIzNiwiYXV0aF90aW1lIjoxNjcwNTQwMjM1LCJqdGkiOiI0N2Y5YWE3ZC1iYWM0LTQwOTgtOWJlOC1hY2U3NTUxM2FhN2YiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9yZWFsbXMvc3RpZ21hbiIsImF1ZCI6WyJyZWFsbS1tYW5hZ2VtZW50IiwiYWNjb3VudCJdLCJzdWIiOiJiN2M3OGE2Mi1iODRmLTQ1NzgtYTk4My0yZWJjNjZmZDllZmUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzdGlnLW1hbmFnZXIiLCJub25jZSI6IjMzNzhkYWZmLTA0MDQtNDNiMy1iNGFiLWVlMzFmZjczNDBhYyIsInNlc3Npb25fc3RhdGUiOiI4NzM2NWIzMy0yYzc2LTRiM2MtODQ4NS1mYmE1ZGJmZjRiOWYiLCJhY3IiOiIwIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZV9jb2xsZWN0aW9uIiwiZGVmYXVsdC1yb2xlcy1zdGlnbWFuIiwiYWRtaW4iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbInZpZXctdXNlcnMiLCJxdWVyeS1ncm91cHMiLCJxdWVyeS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgc3RpZy1tYW5hZ2VyOmNvbGxlY3Rpb24gc3RpZy1tYW5hZ2VyOnN0aWc6cmVhZCBzdGlnLW1hbmFnZXI6dXNlcjpyZWFkIHN0aWctbWFuYWdlcjpvcCBzdGlnLW1hbmFnZXI6Y29sbGVjdGlvbjpyZWFkIHN0aWctbWFuYWdlcjpvcDpyZWFkIHN0aWctbWFuYWdlcjp1c2VyIHN0aWctbWFuYWdlciBzdGlnLW1hbmFnZXI6c3RpZyIsInNpZCI6Ijg3MzY1YjMzLTJjNzYtNGIzYy04NDg1LWZiYTVkYmZmNGI5ZiIsIm5hbWUiOiJTVElHTUFOIEFkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic3RpZ21hbmFkbWluIiwiZ2l2ZW5fbmFtZSI6IlNUSUdNQU4iLCJmYW1pbHlfbmFtZSI6IkFkbWluIn0.a1XwJZw_FIzwMXKo-Dr-n11me5ut-SF9ni7ylX-7t7AVrH1eAqyBxX9DXaxFK0xs6YOhoPsh9NyW8UFVaYgtF68Ps6yzoiqFEeiRXkpN5ygICN3H3z6r-YwanLlEeaYR3P2EtHRcrBtCnt0VEKKbGPWOfeiNCVe3etlp9-NQo44'

export async function initNetwork () {
  if (!net) {
    net = await new Network().start()
    await TestContainers.exposeHostPorts(8080)
  }
  return net
}

export async function runWatcherPromise ({
  entry = 'index.js',
  env = {},
  logToConsole = true,
  inspect = false,
  consoleLog = false,
  resolveOnClose = true,
  resolveOnMessage = 'ready'
}) {
  return new Promise((resolve, reject) => {
    const helperDir = dirname(fileURLToPath(import.meta.url))
    const indexJsPath = path.resolve(helperDir, '..', '..', entry)

    const options = []
    if (inspect) {
      options.push('--inspect-brk')
    }
    options.push(indexJsPath)

    const args = [
      indexJsPath,
      '--mode',
      `${env.mode}`,
      '--api',
      `${env.apiBase}`,
      '--authority',
      env.authority,
      '--collection-id',
      env.collectionId,
      '--client-id',
      env.clientId,
      '--prompt',
      env.clientSecret,
      '--path',
      env.path,
      ...(env.oneShot ? ['--one-shot'] : []),
      '--response-timeout',
      `${env.responseTimeout}`,
      '--history-write-interval',
      `${env.historyWriteInterval}`,
      '--history-file',
      env.historyFile,
       `${env.logLevel ? '--log-level' : ''}`,
      `${env.logLevel ? env.logLevel : ''}`,
      '--scan-interval',
      `${env.scanInterval}`,
      '--cargo-delay',
      `${env.cargoDelay}`,
      '--cargo-size',
      `${env.cargoSize}`,
      ...(env.addExisting ? ['--add-existing'] : [])
    ]
    // pass options
    const watcher = spawn(nodeCmd, args, {
      // stdio: logToConsole ? 'inherit' : 'ignore',
      env: { ...env }
    })

    watcher.on('error', err => {
      reject(err)
    })

    const resolution = {
      process: watcher,
      logRecords: [],
      logEvents: new EventEmitter(),
      stop: async function () {
        if (this.process) {
          this.process.kill()
          await waitChildClose(this.process)
        }
      }
    }

    readline
      .createInterface({
        input: watcher.stdout,
        crlfDelay: Infinity
      })
      .on('line', line => {
        if (consoleLog) console.log(line)
        const json = JSON.parse(line)
        resolution.logRecords.push(json)
        resolution.logEvents.emit(json.type, json)
        if (json.message === resolveOnMessage) {
          resolve(resolution)
        }
      })

    watcher.on('close', () => {
      if (resolveOnClose) {
        resolve(resolution)
      }
    })
    if (resolveOnMessage === null) {
      resolve(resolution)
    }
  })
}

export async function runWatcher ({
  entry = 'index.js',
  env = {},
  logToConsole = true,
  inspect = false,
  consoleLog = false
}) {
  try {
    const helperDir = dirname(fileURLToPath(import.meta.url))
    const indexJsPath = resolve(helperDir, '..', '..', entry)

    const args = [
      indexJsPath,
      '--mode',
      `${env.mode}`,
      '--api',
      `${env.apiBase}`,
      '--authority',
      env.authority,
      '--collection-id',
      env.collectionId,
      '--client-id',
      env.clientId,
      '--prompt',
      env.clientSecret,
      '--path',
      env.path,
      ...(env.oneShot ? ['--one-shot'] : []),
      '--response-timeout',
      `${env.responseTimeout}`,
      '--history-write-interval',
      `${env.historyWriteInterval}`,
      '--history-file',
      env.historyFile,
      '--scan-interval',
      `${env.scanInterval}`,
      `${env.logLevel ? '--log-level' : ''}`,
      `${env.logLevel ? env.logLevel : ''}`,
      '--cargo-delay',
      `${env.cargoDelay}`,
      '--cargo-size',
      `${env.cargoSize}`,
      ...(env.addExisting ? ['--add-existing'] : [])
    ]

    const options = []
    if (inspect) {
      options.push('--inspect-brk')
    }
    options.push(indexJsPath)

    const watcher = spawn(nodeCmd, args, {
      // stdio: logToConsole ? 'inherit' : 'ignore',
      env: { ...env }
    })

    const value = {
      process: watcher,
      logRecords: []
    }

    readline
      .createInterface({
        input: watcher.stdout,
        crlfDelay: Infinity
      })
      .on('line', line => {
        if (consoleLog) console.log(line)
        const json = JSON.parse(line)
        value.logRecords.push(json)
      })
    return value
  } catch (err) {
    console.error('Error in runWatcher:', err)
    throw err
  }
}

export function getPorts (basePort) {
  return {
    apiPort: basePort,
    dbPort: basePort + 1,
    oidcPort: basePort + 2,
    apiOrigin: `http://localhost:${basePort}`,
    oidcOrigin: `http://localhost:${basePort + 2}`
  }
}

const executeRequest = async (url, method, token, body = null) => {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  }
  const response = await fetch(url, options)
  const headers = {}
  response.headers.forEach((value, key) => {
    headers[key] = value
  })
  return {
    status: response.status,
    headers,
    body: await response.json().catch(() => ({}))
  }
}

export async function startDb () {
  // return the started container so callers can await it
  const db = await new GenericContainer('mysql:8.0')
    .withPullPolicy(PullPolicy.alwaysPull())
    .withEnvironment({ MYSQL_ROOT_PASSWORD: 'rootpw' })
    .withEnvironment({ MYSQL_DATABASE: 'stigman' })
    .withEnvironment({ MYSQL_USER: 'stigman' })
    .withEnvironment({ MYSQL_PASSWORD: 'stigman' })
    .withNetwork(net)
    .withNetworkAliases('db')
    .withWaitStrategy(
      Wait.forLogMessage(
        /ready for connections.*port:\s*3306/i
      ).withStartupTimeout(120_000)
    )
    .start()
    return db
}

export async function startAuth () {
  auth = new MockOidc({ keyCount: 1, includeInsecureKid: false })
  await auth.start({ port: AUTH_PORT })
  return auth
}

export async function startApi () {
  // wait specifically for the JSON log line with "component":"server","type":"started"
  const api = await new GenericContainer('nuwcdivnpt/stig-manager:latest')
    .withPullPolicy(PullPolicy.alwaysPull())
    .withExposedPorts(54000)
    .withNetwork(net)
    .withNetworkAliases('api')
    .withEnvironment({ STIGMAN_DB_PORT: 3306 })
    .withEnvironment({ STIGMAN_DB_PASSWORD: 'stigman' })
    .withEnvironment({
      STIGMAN_API_AUTHORITY: `http://host.testcontainers.internal:8080`
    })
    .withEnvironment({ STIGMAN_API_PORT: 54000 })
    .withEnvironment({ STIGMAN_DEPENDENCY_RETRIES: `2` })
    .withEnvironment({ STIGMAN_DB_HOST: 'db' })
    .withEnvironment({ STIGMAN_DEV_ALLOW_INSECURE_TOKENS: 'true' })
    .withWaitStrategy(
      Wait.forLogMessage(
        /"component":"server","type":"started"/i
      ).withStartupTimeout(120_000)
    )
    .start()
    apiHost = api.getHost()
    apiPort = api.getMappedPort(54000)
    return api
}

/**
 * Waits for a child process to close.
 * @param {ChildProcess} child - The child process to wait for.
 * @returns {Promise<number>} A promise that resolves with the exit code of the child process.
 */
export function waitChildClose (child) {
  return new Promise((resolve, reject) => {
    if (child.exitCode !== null) {
      resolve(child.exitCode)
    }
    child.on('close', code => {
      resolve(code)
    })
    child.on('error', err => {
      reject(err)
    })
  })
}

export async function stopProcesses (processNames) {
  for (const name of processNames) {
    await name.stop()
  }
  if (net) await net.stop()
}

export async function createWatcherUser() {

  const username = "stigmanadmin"
  const post = {
    collectionGrants: [],
    userGroups: [],
    username: 'stigman-watcher'
  }
  const res = await fetch(`http://${apiHost}:${apiPort}/api/users?elevate=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.getToken({username, privileges:['create_collection', 'admin']})}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(post)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP error, Status: ${res.status}`)
  }
  return res.json()
}

export async function createCollection(collectionPost, userId) {
  // if no collecitonPost is passed in, use the default
  if (!collectionPost) {
    collectionPost = {
      name: 'test',
      description: 'Collection TEST description',
      settings: {
        fields: {
          detail: {
            enabled: 'always',
            required: 'findings'
          },
          comment: {
            enabled: 'always',
            required: 'findings'
          }
        },
        status: {
          canAccept: true,
          minAcceptGrant: 2,
          resetCriteria: 'result'
        },
        history: {
          maxReviews: 2
        },
        importOptions: {
          autoStatus: {
            fail: 'submitted',
            notapplicable: 'submitted',
            pass: 'submitted'
          },
          unreviewed: 'commented',
          unreviewedCommented: 'informational',
          emptyDetail: 'replace',
          emptyComment: 'ignore',
          allowCustom: true
        }
      },
      metadata: {
        pocName: 'poc2Put',
        pocEmail: 'pocEmailPut@email.com',
        pocPhone: '12342',
        reqRar: 'true'
      },
      grants: [
        userId ? { roleId: 4, userId } : undefined
      ],
      labels: [
        {
          name: 'TEST',
          description: 'Collection label description',
          color: 'ffffff'
        }
      ]
    }
  }

  const username = "stigmanadmin"
  const res = await fetch(
    `http://${apiHost}:${apiPort}/api/collections?elevate=true&projection=grants&projection=labels`,
    {
      method: 'POST',
      headers: {
         Authorization: `Bearer ${auth.getToken({username, privileges:['create_collection', 'admin']})}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(collectionPost)
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP error, Status: ${res.status}`)
  }
  return res.json()
}

export async function initWatcherTestCollection () {

  const user = await createWatcherUser()
  const collection = await createCollection(null, user.userId)
  return { user, collection }
}

/**
 * waitFor: Repeatedly checks a condition until it's true or times out.
 *
 * @param {Function} conditionFn - returns true when ready, false otherwise.
 * @param {number} timeoutMs - maximum time to wait.
 * @param {number} intervalMs - how often to poll.
 * @returns {Promise<void>} resolves when condition is true, rejects on timeout.
 */
export async function waitFor(conditionFn, timeoutMs = 5000, intervalMs = 100) {
  const start = Date.now()

  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        if (await conditionFn()) {
          return resolve()
        }
        if (Date.now() - start >= timeoutMs) {
          return reject(new Error(`waitFor timed out after ${timeoutMs}ms`))
        }
        setTimeout(check, intervalMs)
      } catch (err) {
        reject(err)
      }
    }
    check()
  })
}

export async function clearHistoryFileContents(historyFilePath) {
  try {
    const pathToFile = resolve(historyFilePath) 
    fs.writeFileSync(pathToFile, '', 'utf8')
    return
  } catch (err) {
    console.error('Error clearing history file:', err)
    throw err
  }
}