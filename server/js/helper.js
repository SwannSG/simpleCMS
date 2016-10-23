const fs = require('fs');

// helper functions******************************************************************************
const markdownFileType = (arg) => {
  // conditionally add properties to arg: mdFileType, target
  var partFilename = arg.file_in.slice(arg.file_in.lastIndexOf('/') + 1, arg.file_in.lastIndexOf('.'));
  if (partFilename.includes('event-stub-')) {
    arg.mdFiletype = 'event-stub';
    arg.htmlTarget = 'event-' + partFilename.slice(-1);
  } else {
    arg.mdFiletype = 'none';
  }
  return;
};

const eventStubMap = (line, arg) => {
  // changes markdown, removes Title:, When:, Where:
  // add property names and values to arg:
  var result = /^[Ss]heet[ ]*:[ ]*(.*)/.exec(line.trim());
  if (result) {
    arg.sheetName = result[1];
    return '';
  }
  return line;
};



// promises *********************************************
// we can cascade parameters (to be used later in another promise) passed to the first promise function, by passing all parameters needed to the first paramter.
const fileExist = (arg) => {
  // does file_in exist ?
  // arg = {file_in: string, file_out: string}
  if (!arg.file_in) {
    return new Promise((resolve, reject) => {
      reject('function fileExist: invalid parmeters');
    });
  }
  return new Promise((resolve, reject) => {
    fs.access(arg.file_in, (err) => {
      if (err && err.code === 'ENOENT') {
        reject('function fileExist: file ' + arg.file_in + ' does not exist');
      } else {
        // categorise a filetype by looking at the filename, adds arg.mdFiletype property
        markdownFileType(arg);
        resolve(arg);
      }
    });
  });
};

const readFile = (arg) => {
  // read file_in and produce one long string 'textOut'
  // arg = {file_in: string, file_out: string}
  // arg.textOut added

  // create readstream(physicalFileLocation)
  var fp = fs.createReadStream(arg.file_in);

  // create readLine(readStream, terminal)
  var rl = require('readline').createInterface({
    input: fp,
    terminal: false
  });
  var textOut = '';
  rl.on('line', function(line) {
    if (arg.mdFiletype === 'event-stub') {
      // for an event-stub-n.md file we get some parameters and mess with the text
      textOut = textOut + '\n' + eventStubMap(line, arg);
    } else {
      textOut = textOut + '\n' + line;
    }
  });

  var promise = new Promise((resolve, reject) => {
    // if file_in takes too long to read we generate an error
    var timer = setTimeout(() => {
      reject('function readFile: taking too long to read file ' + arg.file_in);
    }, 1000);

    // rl.on event is triggered when file_in eof reached
    rl.on('close', () => {
      // file_in read ok
      clearTimeout(timer);
      arg.textOut = textOut;
      resolve(arg);
    });
  });
  return promise;
};
// end promises *****************************************

module.exports.fileExist = fileExist;
module.exports.readFile = readFile;
