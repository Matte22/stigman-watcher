import { expect } from 'chai'
import sinon from 'sinon'
import fs from 'fs'
import { jest } from 'jest'
import { setUpHistory } from '../../lib/scan.js'

describe('setUpHistory()', () => {
  let existsSyncStub, createWriteStreamStub, readFileSyncStub
  let lineByLineMock

  beforeEach(() => {
    existsSyncStub = sinon.stub(fs, 'existsSync')
    createWriteStreamStub = sinon.stub(fs, 'createWriteStream')
    readFileSyncStub = sinon.stub(fs, 'readFileSync')

    jest.mock('line-by-line', () => {
      return jest.fn().mockImplementation(() => {
        return {
          next: jest.fn().mockImplementationOnce(() => Buffer.from('mocked line 1'))
                            .mockImplementationOnce(() => Buffer.from('mocked line 2'))
                            .mockImplementationOnce(() => null)
        };
      });
    });
  })


  afterEach(() => {
    sinon.restore()
  })

  // it('should return history object with no historyFile', () => {
  //   const config = { historyFile: null }
  //   const result = setUpHistory(config)
  //   expect(result.history).to.be.a('Set')
  //   expect(result.historyStream).to.be.undefined
  //   expect(result.lineCount).to.equal(0)
  //   expect(result.config).to.equal(config)
  // })

  // it('should handle non-existing history file correctly', () => {
  //   // Mock config
  //   const config = { historyFile: 'path/to/history' };

  //   // Setup stubs for this test case
  //   existsSyncStub.withArgs(config.historyFile).returns(false);
  //   createWriteStreamStub.withArgs(config.historyFile).returns(/* Mocked stream */);

  //   const result = setUpHistory(config);

  //   // Assertions
  //   expect(existsSyncStub.calledWith(config.historyFile)).to.be.true;
  //   expect(createWriteStreamStub.calledWith(config.historyFile)).to.be.true;
  //   // Additional assertions as needed
  // });

  it('should populate history set correctly from file', () => {
    // Simulated history file content
    const fakeHistoryContent = 'file1\nfile2\nfile3'

    const config = { historyFile: 'sample.history' }
    existsSyncStub.withArgs(config.historyFile).returns(true)

    const result = setUpHistory(config)
    console.log(result)

    // Assuming result contains a Set named 'history'
    // expect(result.history).to.be.an('set');
    // expect(result.history.has('file1')).to.be.true;
    // expect(result.history.has('file2')).to.be.true;
    // expect(result.history.has('file3')).to.be.true;
  })
  it('should populate history set correctly from file', () => {})
})
