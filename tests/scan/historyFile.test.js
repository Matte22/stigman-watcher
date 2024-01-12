const sinon = require('sinon')
const proxyquire = require('proxyquire')
const fs = require('fs')
;(async () => {
  const chai = await import('chai')
  const expect = chai.expect

  // Rest of your test code
})()


describe('startScanner', () => {
  let stubs, mockFs, mockFg, startScanner;

  let config = {
    historyFile: 'some/path/history.txt',
    scanInterval: 1000
  };

  beforeEach(() => {
    
    process.env.WATCHER_ADD_EXISTING=true
    process.env.WATCHER_API_BASE='http://localhost:54000/api'
    process.env. WATCHER_AUTHORITY='http://localhost:8080/realms/stigman'
    process.env. WATCHER_CARGO_DELAY=2000
    process.env. WATCHER_CARGO_SIZE=10
    process.env.WATCHER_CLIENT_ID='stigman-watcher'
    process.env. WATCHER_CLIENT_SECRET='954fd71a-dad6-47ab-8035-060268f3d396'
   // #WATCHER_CLIENT_KEY=/home/mathew/Documents/CodeWorkspace/watcherStuff/public_key.pem
    //#WATCHER_CLIENT_KEY=/home/mathew/Documents/CodeWorkspace/watcherStuff/private_key.pem
   // #WATCHER_CLIENT_KEY_PASSPHRASE=
   process.env.WATCHER_COLLECTION=341
   // #WATCHER_CREATE_OBJECTS=false
  //  #WATCHER_IGNORE_GLOBS=**/ignoredDir,**/someDir/ignoredFile
   // #WATCHER_LOG_FILE=
   // #WATCHER_LOG_FILE_LEVEL=debug
   process.env.WATCHER_PATH='/home/mathew/Documents/CodeWorkspace/watcherStuff/watched/ckl/'
    //#WATCHER_PATH=//unc/path
   // #WATCHER_USE_POLLING=false
   // #WATCHER_STABILITY_THRESHOLD=5000
   process.env.WATCHER_HISTORY_FILE='/home/mathew/Documents/CodeWorkspace/watcherStuff/watcher.history'
   process.env.WATCHER_MODE='scan'
   

    try {
      stubs = {
        fs: {
          readFileSync: sinon.stub().returns('mock history data'),
          existsSync: sinon.stub(),
          createWriteStream: sinon.stub(),
          writeFileSync: sinon.stub()
        },
        fg: sinon.stub().resolves(new Set(['file1.ckl', 'file2.xml']))
      };
  
      mockFs = stubs.fs;
      mockFg = stubs.fg;
  
      console.log("Loading the startScanner module with proxyquire...");
      const module = proxyquire('../../lib/scan.js', {
        'fs': mockFs,
        'fast-glob': mockFg,
        '../../lib/args': config
      })
  
     startScanner = module.startScanner;
      console.log("Module loaded successfully.");
    } catch (error) {
      console.error("Error loading module with proxyquire:", error);
      throw error; // Re-throw the error to ensure Mocha catches it
    }
  });
  

  afterEach(() => {
    sinon.restore();
  });

  it('should rewrite history if current directory differs from history', async () => {
  
     // await startScanner();
    
      // Assert fs.readFileSync was called
    //  sinon.assert.calledOnce(mockFs.readFileSync);
      
      // Assert fast-glob was called with expected args
      //sinon.assert.calledWith(mockFg, 'some/path/*');
    
      // You can also assert the behavior based on the stubs' return values
      // For example, if `startScanner` behaves differently based on file contents
    
    
  });



  // it('should add new files to history and update history file', async () => {
  //   // Arrange
  //   // Mock existing files in history
  //   const existingFiles = new Set(['/path/to/existingFile1', '/path/to/existingFile2']);
  //   mockFs.readFileSync.returns([...existingFiles].join('\n'));
  
  //   // Mock fast-glob to return new files along with existing ones
  //   const newFiles = ['/path/to/newFile1', '/path/to/newFile2'];
  //   const allFiles = [...existingFiles, ...newFiles];
  //   mockFg.stream.resolves(allFiles);
  
  //   // Act
  //   await scanner.startScanner();
  
  //   // Assert
  //   // Check if history file is updated with new files
  //   // (Assuming historyStream.write is used for appending new entries)
  //   sinon.assert.calledWith(mockFs.createWriteStream, mockConfig.historyFile, { flags: 'a' });
  //   newFiles.forEach(file => {
  //     sinon.assert.calledWith(mockFs.createWriteStream().write, `${file}\n`);
  //   });
  // });
  

  // Additional tests as needed
})
