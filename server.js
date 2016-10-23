// require *********************************
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const marked = require('marked');

// 'simpleCMS/server/js' dir for own js
const helper = require('./server/js/helper');


// end require *****************************

// application configuration **************
const config = {
  adminDir: '/client/html/admin/',
  mdUpload: '/public/markdown/',
  clientHtml: '/client/html/user/',
  imagesDir: '/public/images/',
  serverDocFile: '/server/data/documentMap.txt'
};
// end application configuration **********


// Async highlighting with pygmentize-bundled *************
marked.setOptions({
  // highlight: function(code, lang, callback) {
  //   require('pygmentize-bundled')({
  //     lang: lang,
  //     format: 'html'
  //   }, code, function(err, result) {
  //     callback(err, result.toString());
  //   });
  // }
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
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

// helper functions******************************************************************************
app.pvt.markdownFileType = (arg) => {
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

app.pvt.eventStubMap = (line, arg) => {
  // changes markdown, removes Title:, When:, Where:
  // add property names and values to arg:
  var result = /^[Ss]heet[ ]*:[ ]*(.*)/.exec(line.trim());
  if (result) {
    arg.sheetName = result[1];
    return '';
  }
  return line;
};

app.pvt.addHTML = (arg) => {
  if (arg.mdFiletype === 'event-stub') {
    arg.htmlOut = '<div class="event-stub">' + arg.htmlOut;
    // add button strip
    arg.htmlOut = arg.htmlOut + '<div class="event-stub-button-line"> \
      <button onclick="event_stub.moreInfo(\'' + arg.htmlTarget + '\')">More Info</button> \
      <button onclick="event_stub.book({sheetName:\'' + arg.sheetName + '\'})">Book</button> \
      <button> iCal </button> \
      </div> ';
    arg.htmlOut = arg.htmlOut + '</div>';
  }
};
// end helper functions******************************************************************************


// promises *********
// we can cascade parameters (to be used later in another promise) passed to the first promise function, by passing all parameters needed to the first paramter.
app.pvt.fileExist = (arg) => {
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
        app.pvt.markdownFileType(arg);
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
    if (arg.mdFiletype === 'event-stub') {
      // for an event-stub-n.md file we get some parameters and mess with the text
      textOut = textOut + '\n' + app.pvt.eventStubMap(line, arg);
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

app.pvt.mdToHTML = (arg) => {
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

app.pvt.addHTMLwrapper = (arg) => {
  // add wrapper html around html
  //    the wrapper html will depend on the file_out filename
  // arg = {file_in: string, file_out: string, arg.textOut: markdown_text, arg.htmlOut}
  var err = false;
  if (arg.mdFiletype.includes('event-stub')) {
    app.pvt.addHTML(arg);
  }

  return new Promise((resolve, reject) => {
    if (err) {
      reject('An error occured');
    }
    resolve(arg);
  });
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

app.pvt.getImgFilenames = (path) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject('Error: getImgFilenames' + err);
      } else {
        resolve(files);
      }
    });
  });
};

app.pvt.deleteImage = (path) => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject('Error: deleteImage ' + err);
      } else {
        resolve('deleteImage: success');
      }
    });
  });
};


// end promises ***********************************************************************************************
// end add private methods and properties here *********************************************************


// read and load document json config file ********************************************************
// executed on startup
app.pvt.fileExist({
    file_in: __dirname + config.serverDocFile
  })
  .then(app.pvt.readFile)
  .then((x) => {
    app.pvt.serverDocFile = JSON.parse(x.textOut);
  })
  .catch(() => {
    // file_in does not exist, initialise object
    app.pvt.serverDocFile = {};
  });
// end read and load document json config file ****************************************************

// save json object to specified file *************************************************************
app.pvt.serverDocFile = {
  1: 1,
  a: 2,
  b: [1, 2, 3]
};
app.pvt.writeFile({
    file_out: __dirname + config.serverDocFile,
    htmlOut: JSON.stringify(app.pvt.serverDocFile)
  })
  .then()
  .catch();
// end save json object to specified file *********************************************************



// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.listen(3000, function() {});


// Express looks up the files relative to the static directory,
// so the name of the static directory is not part of the URL.
app.use(express.static('client'));
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
});

app.get('/event-3-json', (req, res) => {
  // get html snippet filename
  var htmlFilename = __dirname + '/client/html/user/event-3-form.html';
  // read associated html snippet asynch
  helper.fileExist({
      file_in: htmlFilename
    })
    .then(helper.readFile)
    .then((result) => {
      // create json response object
      var jsonRsp = {
        htmlSnippet: result.textOut
      };
      // attach variable substitution
      jsonRsp.sheetName = 'NameOfSheetInGoogleDocs';
      // send to client
      res.json(jsonRsp);
    })
    .catch((err) => {
      res.json({
        status: err
      });
    });
});





app.get('/admin', (req, res) => {
  res.sendFile(__dirname + config.adminDir + 'admin-index.html');
});

app.get('/admin-main-images', (req, res) => {
  // display array of all files in public/images directory
  app.pvt.getImgFilenames(__dirname + config.imagesDir.slice(0, -1))
    .then((x) => {
      res.json({
        static: 'images/',
        images: x
      });
    })
    .catch((x) => {
      res.json({
        static: 'images/',
        images: x
      });
    });
});

app.delete('/admin-main-images-delete', (req, res) => {
  var imgToDelete = req.body.imageName;
  imgToDelete = __dirname + config.imagesDir + imgToDelete;
  app.pvt.deleteImage(imgToDelete)
    .then(() => {
      // redirect to show all images
      res.json('status: success');
    })
    .catch((err) => {
      res.json('status: error' + err);
    });
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

  setTimeout(function() {
    if (app.pvt.fileAccepted) {
      if (req.body['file-type'] === 'md') {
        // convert markdown file
        var file_in = __dirname + config.mdUpload + app.pvt.filename;
        var file_out = __dirname + config.clientHtml + file_in.slice(file_in.lastIndexOf('/'), file_in.lastIndexOf('.')) + '.html';
        app.pvt.fileExist({
            file_in: file_in,
            file_out: file_out
          })
          .then(app.pvt.pathExist)
          .then(app.pvt.readFile)
          .then(app.pvt.mdToHTML)
          .then(app.pvt.addHTMLwrapper)
          .then(app.pvt.writeFile)
          .then(() => {
            // shows success of chain of operations
            res.json({
              status: 'Markdown file converted and loaded'
            });
          })
          .catch((err) => {
            res.json({
              status: 'Error: Markdown file not converted' + err
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
  res.sendFile(__dirname + '/index.html');
});

app.get('/uploadfile', function(req, res) {
  res.sendFile(__dirname + '/client/html/mgmt/uploadFile.html');
});

app.get('/uploadfile1', function(req, res) {
  res.sendFile(__dirname + '/client/html/mgmt/uploadFile1.html');
});

app.get('/postJSON', (req, res) => {
  res.sendFile(__dirname + '/client/html/mgmt/postJSON.html');
});

app.post('/rest/jsonData', (req, res) => {
  // bodyParser handles this in req.body and returns js object
  var jsObj = req.body;
  res.send(jsObj);
});






app.get('/readwritewp', (req, res) => {
  // read, write with promises


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

  var file_in = __dirname + '/md/testFile.html';
  var file_out = __dirname + '/md/testFileOut.html';

  // library to read files
  var fs = require('fs');

  // does file exist
  fs.access(file_in, function(err) {
    if (err && err.code === 'ENOENT') {
      res.send('File does not exist: ' + file_in);
    } else {

      // check path to file_out exists
      // get file_out path
      fs.access(require('path').dirname(file_out), function(err) {
        if (err) {
          // file_out path not exist
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
              textOut = textOut + '\n' + line;

            }
            // we need to write to file_out HOW TO DETECT
          });
          rl.on('close', function() {
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
