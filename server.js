// require *********************************
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const marked = require('marked');

// end require *****************************

// application configuration **************
const config = {
  adminDir: '/client/html/admin/',
  mdUpload: '/public/markdown/',
  clientHtml: '/client/html/user/'
};
// end application configuration **********


// Async highlighting with pygmentize-bundled *************
marked.setOptions({
  highlight: function(code, lang, callback) {
    require('pygmentize-bundled')({
      lang: lang,
      format: 'html'
    }, code, function(err, result) {
      callback(err, result.toString());
    });
  }
});
// end Async highlighting with pygmentize-bundled ********

const app = express();

// add private methods and properties here *************************************************************
// we add a property name 'pvt' to app
app.pvt = {};

app.pvt.fileFilter = function(req, file, cb) {
  if (req.body['file-type'] === 'md' || req.body['file-type'] === 'img') {
    app.pvt.fileAccepted = true;
    cb(null, true);
  } else {
    app.pvt.fileAccepted = false;
    cb(null, false);
  }
};

app.pvt.storage = multer.diskStorage({
  // directory for uploads
  destination: function(req, file, cb) {
    // if file is image save to './public/images'
    // if file is markdown save to './public/markdown'
    // anything else ignore and do nothing
    if (req.body['file-type'] === 'md') {
      cb(null, './public/markdown/');
    } else if (req.body['file-type'] === 'img') {
      cb(null, './public/images/');
    } else {
      // don't load file, how????
      cb(null, './public/');
    }

  },
  // server side filename for upload
  filename: function(req, file, cb) {
    // user provided name else original filename
    app.pvt.filename = req.body.users_filename ? req.body.users_filename.trim() || file.originalname : file.originalname;
    cb(null, app.pvt.filename);
  }
});

// promises ***********************************************************************************************
// we can cascade parameters (to be used later in another promise) passed to the first promise function, by passing all parameters needed to the first paramter.
app.pvt.fileExist = (arg) => {
  // does file_in exist ?
  // arg = {file_in: string, file_out: string}
  if (!arg.file_in || !arg.file_out) {
    return new Promise((resolve, reject) => {
      reject('function fileExist: invalid parmeters');
    });
  }
  return new Promise((resolve, reject) => {
    fs.access(arg.file_in, (err) => {
      if (err && err.code === 'ENOENT') {
        reject('function fileExist: file ' + arg.file_in + ' does not exist');
      } else {
        console.log('fileExist resolve: ' + arg);
        resolve(arg);
      }
    });
  });
};

app.pvt.pathExist = (arg) => {
  // does file_out path exist
  // arg = {file_in: string, file_out: string}
  return new Promise((resolve, reject) => {
    fs.access(require('path').dirname(arg.file_out), function(err) {
      if (err) {
        reject('error file_out path not exist: ' + arg.file_out);
      } else {
        resolve(arg);
      }
    });
  });
};

app.pvt.readFile = (arg) => {
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
    textOut = textOut + '\n' + line;
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

app.pvt.textToMd = (arg) => {
  // convert markdown text to html
  // arg = {file_in: string, file_out: string, arg.textOut: markdown_text}
  var promise = new Promise((resolve, reject) => {
    marked(arg.textOut, (err, htmlOut) => {
      if (err) {
        reject('Error: Failed to convert arg.textOut to arg.htmlOut');
      } else {
        arg.htmlOut = htmlOut;
        resolve(arg);
      }
    });
  });
  return promise;
};

app.pvt.writeFile = (arg) => {
  // write arg.htmlOut to arg.file_out
  return new Promise((resolve, reject) => {
    fs.writeFile(arg.file_out, arg.htmlOut, (err) => {
      if (err) {
        reject('function writeFile: error writing to ' + arg.file_out);
      } else {
        resolve('success');
      }
    });
  });
};
// end promises ***********************************************************************************************

// end add private methods and properties here *********************************************************



// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.listen(3000, function() {
  console.log('listening on 3000');
});


// Express looks up the files relative to the static directory,
// so the name of the static directory is not part of the URL.
app.use(express.static('client'));
app.use(express.static('public'));


app.get('/', (req, res) => {
  console.log(__dirname);
  res.sendFile(__dirname + '/index.html');
  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
});


app.get('/admin', (req, res) => {
  res.sendFile(__dirname + config.adminDir + 'admin-index.html');
});

// upload file to server. If markdown file transform to html file.
app.post('/admin-uploadfile', upload = multer({
  storage: app.pvt.storage,
  fileFilter: app.pvt.fileFilter
}).single('admin-upload-file'), function(req, res) {

  // content-type: text/html
  res.set({
    'Content-Type': 'text/html',
  });

  console.log(app.pvt.fileAccepted);
  setTimeout(function() {
    if (app.pvt.fileAccepted) {
      if (req.body['file-type'] === 'md') {
        // convert markdown file
        var file_in = __dirname + config.mdUpload + app.pvt.filename;
        var file_out = __dirname + config.clientHtml + 'test.html';
        console.log(file_in);
        console.log(file_out);
        app.pvt.fileExist({
            file_in: file_in,
            file_out: file_out
          })
          .then(app.pvt.pathExist)
          .then(app.pvt.readFile)
          .then(app.pvt.textToMd)
          .then(app.pvt.writeFile)
          .then((x) => {
            // shows success of chain of operations
            console.log(x);
            res.json({
              status: 'Markdown file converted and loaded'
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: 'Error: Markdown file not converted'
            });
          });
        // end convert markdown file
      } else {
        res.json({
          status: 'Image file loaded'
        });
      }
    } else {
      res.json({
        status: 'File not accepted'
      });
    }
  }, 1000);
});




app.get('/home', (req, res) => {
  console.log('home');
  res.sendFile(__dirname + '/index.html');
});

app.get('/uploadfile', function(req, res) {
  console.log('get /uploadfile');
  res.sendFile(__dirname + '/client/html/mgmt/uploadFile.html');
});

app.get('/uploadfile1', function(req, res) {
  console.log('get /uploadfile1');
  res.sendFile(__dirname + '/client/html/mgmt/uploadFile1.html');
});



// app.post('/uploadfile', multer({storage: storage}).single('upl'), function(req, res, next){
//     console.log('post /uploadfile');
//     res.send('File uploaded');
// });

app.get('/mdtohtml', (req, res) => {
  console.log('get /mdtohtml');
  var marked = require('marked');

  var markdownString = '```js\n console.log("hello"); \n```';

  // Async highlighting with pygmentize-bundled
  marked.setOptions({
    highlight: function(code, lang, callback) {
      require('pygmentize-bundled')({
        lang: lang,
        format: 'html'
      }, code, function(err, result) {
        callback(err, result.toString());
      });
    }
  });

  // Using async version of marked
  marked(markdownString, function(err, content) {
    if (err) throw err;
    console.log(content);
  });

  res.send('done');
});





app.get('/postJSON', (req, res) => {
  console.log('get postJSON');
  res.sendFile(__dirname + '/client/html/mgmt/postJSON.html');
});

app.post('/rest/jsonData', (req, res) => {
  console.log('post JSON data');
  // bodyParser handles this in req.body and returns js object
  console.log(req.body); // js object
  var jsObj = req.body;
  res.send(jsObj);
});






app.get('/readwritewp', (req, res) => {
  // read, write with promises
  console.log('/readwritewp');


  var file_in = __dirname + '/md/testFile.html';
  var file_out = __dirname + '/md/testFileOut.html';


  var fileExist = (file_in, file_out) => {
    // does file_in exist ?
    if (!file_in || !file_out) {
      return new Promise((resolve, reject) => {
        reject('function fileExist: invalid parmeters');
      });
    }
    return new Promise((resolve, reject) => {
      fs.access(file_in, (err) => {
        if (err && err.code === 'ENOENT') {
          reject('function fileExist: file ' + file_in + ' does not exist');
        } else {
          resolve({
            file_in: file_in,
            file_out: file_out
          });
        }
      });
    });
  };


  var pathExist = (x) => {
    // does file_out path exist
    return new Promise((resolve, reject) => {
      fs.access(require('path').dirname(file_out), function(err) {
        if (err) {
          reject('error file_out path not exist: ' + file_out);
        } else {
          resolve(x);
        }
      });
    });
  };

  var readFile = (x) => {
    // read and process file_in

    // create readstream(physicalFileLocation)
    var fp = fs.createReadStream(x.file_in);

    // create readLine(readStream, terminal)
    var rl = require('readline').createInterface({
      input: fp,
      terminal: false
    });
    var textOut = '';
    rl.on('line', function(line) {
      if (line.indexOf('<html>') < 0 && line.indexOf('</html>') < 0 &&
        line.indexOf('<body>') < 0 && line.indexOf('</body>') < 0) {
        // skip the line and do nothing
        // console.log(line)
        textOut = textOut + '\n' + line;
      }
    });

    var promise = new Promise((resolve, reject) => {
      // if file_in takes too long to read we generate an error
      var timer = setTimeout(() => {
        reject('function readFile: taking too long to read file ' + x.file_in);
      }, 1000);

      // rl.on event is triggered when file_in eof reached
      rl.on('close', () => {
        // file_in read ok
        clearTimeout(timer);
        x.textOut = textOut;
        resolve(x);
      });
    });
    return promise;
  };

  var writeFile = (x) => {
    // write to file_out
    return new Promise((resolve, reject) => {
      fs.writeFile(x.file_out, x.textOut, (err) => {
        if (err) reject('function writeFile: error writing to ' + x.file_out);
        resolve('success');
      });
    });
  };

  fileExist(file_in, file_out) // check file_in exists
    .then(pathExist) // check file_out path exists
    .then(readFile) // read file-in to eof
    .then(writeFile) // write to file_out
    .then((x) => {
      res.send(x);
    }) // shows success of chain of operations
    .catch((err) => {
      res.send(err);
    });

});

app.get('/readfile', (req, res) => {
  // ERROR HANDLING FOR FILES NEEDS TO BE HANDLED !!!!!!!!!!!!!
  // DOES fp GET CLOSED AUTOMATICALLY ?????
  console.log('/readfile');

  var file_in = __dirname + '/md/testFile.html';
  var file_out = __dirname + '/md/testFileOut.html';

  // library to read files
  var fs = require('fs');

  // does file exist
  fs.access(file_in, function(err) {
    if (err && err.code === 'ENOENT') {
      console.log('error: file does not exist');
      res.send('File does not exist: ' + file_in);
    } else {
      console.log('file exists');

      // check path to file_out exists
      // get file_out path
      fs.access(require('path').dirname(file_out), function(err) {
        if (err) {
          // file_out path not exist
          console.log(err.code);
          res.send('error file_out path not exist: ' + file_out);
        } else {
          // file_out path exists
          // create readstream(physicalFileLocation)
          var fp = fs.createReadStream(file_in);

          // create readLine(readStream, terminal)
          var rl = require('readline').createInterface({
            input: fp,
            terminal: false
          });
          // now we can start reading line by line
          var textOut = '';
          rl.on('line', function(line) {
            if (line.indexOf('<html>') < 0 && line.indexOf('</html>') < 0 &&
              line.indexOf('<body>') < 0 && line.indexOf('</body>') < 0) {
              // skip the line and do nothing
              // console.log(line)
              textOut = textOut + '\n' + line;

            }
            // we need to write to file_out HOW TO DETECT
          });
          rl.on('close', function() {
            console.log('rl.on(\'close\'.....');
            fs.writeFile(file_out, textOut, function(err) {
              if (err) {
                res.send('File cockup: ' + err.code);
              } else {
                res.send('File read and saved ok: ' + file_in);
              }
            });
          });
        }
      });
    }
  });
});

app.get('/writefile', (req, res) => {
  console.log('writefile');

  var filename = __dirname + '/md/writeTest.txt';

  var fs = require('fs');

  fs.writeFile(filename, 'New Text to Write', function(err) {
    if (err) {
      console.log('error: writing to ' + filename);
      console.log(err);
    } else {
      console.log('success: writing to ' + filename);
    }
  });

  res.send('File write ok: ' + filename);

});
