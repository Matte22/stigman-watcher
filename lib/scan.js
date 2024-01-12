const fg = require('fast-glob')
const config = require('./args')
const { logger } = require('./logger')
const fs = require('fs')
const parse = require('./parse')
const { serializeError } = require('serialize-error')
const lineByLine = require('n-readlines')

const component = 'scan'

function setUpHistory(config) {
  let history = new Set();
  let historyStream;
  let lineCount = 0;

  if (config.historyFile && fs.existsSync(config.historyFile)) {
    const liner = new lineByLine(config.historyFile);
    let line;
    while (line = liner.next()) {
      history.add(line.toString('ascii'));
      lineCount++;
    }
    logger.verbose({
      component: 'scan',
      message: `history initialized from file`,
      file: config.historyFile,
      entries: lineCount
    });
  }
  if (config.historyFile) {
    historyStream = fs.createWriteStream(config.historyFile, { flags: 'a' });
  }
  return { history, historyStream, lineCount, config };
}

async function startScanner (context) {
  try {

    const { history, lineCount, config } = context;

    // get the current files in the 'watched' directory.
    const currentFiles = await getCurrentDirectoryFiles();

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
      context = await _writeHistory(context, null, true);
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
    if (!config.oneShot) scheduleNextScan(context)
}
}

/**
 * Writes an entry to the history file.
 * @param {Object} context - An object containing history, historyStream, and config.
 * @param {string} entry - The entry to be written.
 * @param {boolean} [rewrite=false] - Indicates whether to rewrite the entire history file or append the entry to the history file. 
 */
async function _writeHistory(context, entry, rewrite = false) {
  try {
    const { history, historyStream, config } = context;
    if (rewrite) {
      // Rewrite the file with the updated history
      fs.writeFileSync(config.historyFile, Array.from(history).join('\n') + '\n');
      // Reopen the stream
      const newHistoryStream = fs.createWriteStream(config.historyFile, { flags: 'a' });
      const updatedContext = {...context, historyStream: newHistoryStream};
      return updatedContext;
    } else {
      historyStream.write(`${entry}\n`);
      return context;
    }
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
async function getCurrentDirectoryFiles() {
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

module.exports = { startScanner, scheduleNextScan, setUpHistory }
