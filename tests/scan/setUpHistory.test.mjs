import { expect } from 'chai'
import sinon from 'sinon'
import fs from 'fs'
import { startScanner, scheduleNextScan, setUpHistory } from '../../lib/scan.js'
describe('setUpHistory()', () => {
  // stubs
  let existsSyncStub, createWriteStreamStub, readFileSyncStub

  beforeEach(() => {
    // stub fs file exists
    existsSyncStub = sinon.stub(fs, 'existsSync')
    // stub fs file write stream
    createWriteStreamStub = sinon.stub(fs, 'createWriteStream')
    // stub fs file read stream
    readFileSyncStub = sinon.stub(fs, 'readFileSync')
  })

  afterEach(() => {
    sinon.restore()
    createWriteStreamStub.restore()
    existsSyncStub.restore()
    readFileSyncStub.restore()
  })

  it('should return history object with no historyFile', () => {
    // passing no history file
    const config = { historyFile: null }
    const result = setUpHistory(config)

    expect(result.history).to.be.a('Set')
    expect(result.lineCount).to.equal(0)
    expect(result.config).to.equal(config)
  })

  it('should handle non-existing history file correctly', () => {
    // Mock config
    const config = { historyFile: 'path/to/history' }

    // Setup stubs for this test case
    existsSyncStub.withArgs(config.historyFile).returns(false) // we didn't find the file


    const result = setUpHistory(config)

    expect(existsSyncStub.calledWith(config.historyFile)).to.be.true
   
    expect(result.history).to.be.empty
   
    expect(result.lineCount).to.equal(0)
    expect(result.config).to.equal(config)
  })

  it('should handle errors from fs.existsSync gracefully', () => {
    const config = { historyFile: 'path/to/history' }

    // Setup stubs for this test case
    existsSyncStub.withArgs(config.historyFile).throws(new Error('Test error')) // simulate an error

    let error
    try {
      setUpHistory(config)
    } catch (e) {
      error = e
    }

    expect(error).to.exist
    expect(error.message).to.equal('Test error')
  })

})
