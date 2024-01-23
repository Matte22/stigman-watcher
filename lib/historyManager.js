const fs = require('fs');
const { serializeError } = require('serialize-error');
const { logger } = require('./logger');
const lineByLine = require('n-readlines')
const Queue = require('better-queue');
let history = new Set();
let historyFilePath = '';
const saveInterval = 15000; // 15 seconds

function loadHistoryFromFile(historyPath) {
  historyFilePath = historyPath;
  if (historyFilePath && fs.existsSync(historyFilePath)) {
    const liner = new lineByLine(historyFilePath);
    let line;

    while (line = liner.next()) {
      history.add(line.toString('ascii'));
    }
    logger.verbose({
      component: 'history manager',
      message: `history initialized from file`,
      file:historyFilePath,

    });
  }
 }

let writeQueue = new Queue(async (batch, cb) => {
  try {
    // Ensure batch is an array and join entries with a newline
    // writing to the  history file
    saveHistoryToFile(Array.from(history).join('\n') + '\n');
  } catch (e) {
    logger.error({
      component: 'historyManager',
      error: serializeError(e)
    });
  } finally {
    cb();
  }
}, {
  batchSize: 5, // max number of enntries that will be processed together
  //batchDelay: 20000,  // minumum time to wait before processing a batch
  batchDelayTimeout: 15000, // Max wait time for a batch
});


function flushWriteQueue() {
  return new Promise((resolve, reject) => {
    writeQueue.on('drain', resolve);
    writeQueue.resume(); // In case the queue is paused
  });
}



function getHistory() {
  return new Set(history); // Return a copy to prevent direct manipulation
}


function addToHistory(entry) {
  // adding to history set and pushing to the write queue
  history.add(entry);
  //writeQueue.push(entry); 
}

// current issue, if we have 3 in the scanned and 3 in the history that are the same and i remove one from the scanned, 
// it is not removed from the historyfile because it will not interact with the queue which triggers the write to the file

function removeFromHistory(entry) {
  // deleteing something from the history set and pushing to the write queue
  history.delete(entry);
}

function setHistory(historySet) {
  history = historySet;
}

function saveHistoryToFile() {
  try {
    const data = Array.from(history).join('\n') + '\n';
    fs.writeFileSync(historyFilePath, data); 
    logger.info({
      component: 'historyManager',
      message: `history file overwritten with new data`,
      file: historyFilePath
    });
  } catch (e) {
    logger.error({
      component: 'historyManager',
      error: serializeError(e)
    });
  }
}


setInterval(() => {
  logger.info({
    component: 'historyManager',
    message: `saving history to file from the setInterval`,
    file: historyFilePath
  });
  saveHistoryToFile();
}, saveInterval);


// // Handle shutdown
// process.on('SIGINT', async () => {
//   logger.info({ message: 'Application is shutting down. Flushing write queue...' });
  
//   // Clear the write timer
//   clearTimeout(writeTimer);
  
//   // Flush the write queue
//   await flushWriteQueue();

//   // Save the current state of history to file
//   const historyData = Array.from(history).join('\n') + '\n';
//   saveHistoryToFile(historyData);

//   // Now it's safe to exit
//   process.exit(0);
// });



module.exports = {
  loadHistoryFromFile,
  getHistory,
  addToHistory,
  removeFromHistory,
  setHistory,
  saveHistoryToFile,
  
  // flushWriteQueue
};