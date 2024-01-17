const fg = require('fast-glob')
const config = require('./args')
const { logger } = require('./logger')
const fs = require('fs')
const parse = require('./parse')
const { serializeError } = require('serialize-error')
const lineByLine = require('n-readlines')

const component = 'scan'

function readHistoryFile(historyFilePath) {

  const liner = new lineByLine(historyFilePath);
  let line;
  const lines = new Set();

  while (line = liner.next()) {
    lines.add(line.toString('ascii'));
  }

  return lines;
}

function setUpHistory(config) {
  let history = new Set();
  let lineCount = 0;

  if (config.historyFile && fs.existsSync(config.historyFile)) {
    history = readHistoryFile(config.historyFile);
    lineCount = history.size;
    logger.verbose({
      component: 'scan',
      message: `history initialized from file`,
      file: config.historyFile,
      entries: lineCount
    });
  }
  
 return { history, lineCount, config };
}

async function startScanner (context) {
  let { history, lineCount, config } = context;

  try {

    // get the current files in the 'watched' directory.
    const currentFiles = await getCurrentDirectoryFiles(config);

    // Remove files from history that no longer exist
    history.forEach((file) => {
      if (!currentFiles.has(file)) {
        history.delete(file);
        logger.verbose({
          component: component,
          message: `history delete`,
          file: file
        });
      }
    });

  
    // rewrite history file if we have a difference in our new set vs the original history set
    if (config.historyFile && history.size !== lineCount) {
      // After updating context
      context = await _writeHistory(context, null, true);
      ({ history, lineCount, config } = context); // Destructure updated context
    }
    

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
        if (config.historyFile){
          context = await _writeHistory(context, entry);
          ({ history, lineCount, config } = context); // Destructure updated context
        }
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
    scheduleNextScan(context)
    }
    else{
      logger.info({component: component, message: `one-shot scan completed`, path: config.path})
    }
  }
}
async function _writeHistory(context, entry, rewrite = false) {
  try {
    const { history, lineCount, config } = context;
    
    let historyStream;

    if (rewrite) {
      historyStream = fs.createWriteStream(config.historyFile, { flags: 'w' });
    } else {
      historyStream = fs.createWriteStream(config.historyFile, { flags: 'a' });
    }

    // Attach finish listener immediately after stream creation
    const finishPromise = new Promise((resolve) => historyStream.on('finish', resolve));

    if (rewrite) {
      for (const histEntry of history) {
        if (!historyStream.write(`${histEntry}\n`)) {
          // Wait for drain event if the buffer is full
          await new Promise(resolve => historyStream.once('drain', resolve));
        }
      }
    } else {
      historyStream.write(`${entry}\n`);
    }

    // Ensure all data is flushed to the file system
    historyStream.end();

    // Wait for the 'finish' event to ensure all data is written
    await finishPromise;
    
    const updatedContext = {...context , lineCount: history.size};
    return updatedContext;

  } catch (e) {
    logger.error({
      component: component,
      error: serializeError(e)
    });
    return context; // Return the unchanged context
  }
}




/**
 * Retrieves the files in the current directory based on the specified configuration.
 * @returns {Promise<Set<string>>} A promise that resolves to a set of file paths.
 */
async function getCurrentDirectoryFiles(config) {
  try {
   
    // Get the current files in the 'watched' directory.
    const files = await fg([`${config.path}/**/*.ckl`, `${config.path}/**/*.xml`, `${config.path}/**/*.cklb`], {
      dot: !config.ignoreDot,
      suppressErrors: true,
      ignore: config.ignoreGlob ?? []
    });
    // return the files as a set
    return new Set(files);
  } catch (e) {
    logger.error({
      component: component,
      error: serializeError(e)
    });
    return new Set();
  }
}



function scheduleNextScan (context) {
  const { config } = context;
  
  setTimeout(() => startScanner(context), config.scanInterval); 
  logger.info({ 
    component: component, 
    message: `scan scheduled`, 
    path: config.path,
    delay: config.scanInterval 
  })
}

module.exports = { startScanner, scheduleNextScan, setUpHistory, readHistoryFile }

