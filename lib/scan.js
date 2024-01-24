const fg = require('fast-glob')
const { logger } = require('./logger')
const fs = require('fs')
const parse = require('./parse')
const { serializeError } = require('serialize-error')
const historyManager = require('./historyManager')
const component = 'scan'


function setUpHistory(config) {
  if (config.historyFile) historyManager.loadHistoryFromFile(config.historyFile);
}

async function startScanner(config) {
  let currentFilesSet = new Set();
  try {
      const stream = fg.stream([`${config.path}/**/*.ckl`, `${config.path}/**/*.xml`, `${config.path}/**/*.cklb`], {
          dot: !config.ignoreDot,
          suppressErrors: true,
          ignore: config.ignoreGlob ?? []
      });

      logger.info({ component: component, message: `scan started`, path: config.path });

      for await (const entry of stream) {
          currentFilesSet.add(entry);
          logger.verbose({ component: component, message: `discovered file`, file: entry });
          if (historyManager.getHistory().has(entry)) {
            logger.verbose({component: component, message: `history match`, file: entry})
          }
          else {
            // add here for issue 70
            parse.queue.push(entry)
            logger.info({component: component, message: `queued for parsing`, file: entry})
          }
      }

      // Identify stale files: those in the history but not in the current scan
      historyManager.getHistory().forEach(file => {
          if (!currentFilesSet.has(file)) {
              // Remove stale files from history
              historyManager.removeFromHistory(file);
          }
      });


      console.log(historyManager.getHistory())  

      logger.info({ component: component, message: `scan ended`, path: config.path });
  } catch (e) {
      logger.error({ component: component, error: serializeError(e) });
  } finally {
      if (!config.oneShot) {
          scheduleNextScan(config);
      } else {
          logger.info({ component: component, message: `one-shot scan completed`, path: config.path });
      }
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



module.exports = { startScanner, scheduleNextScan, setUpHistory }
