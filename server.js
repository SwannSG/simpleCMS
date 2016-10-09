const express = require('express');
const app = express();

const bodyParser = require('body-parser')
const multer  =   require('multer');

const config = {
    adminDir: '/client/html/admin/'
}



app.use(bodyParser.json());

app.listen(3000, function() {
  console.log('listening on 3000')
});

// add private methods and properties here
app.pvt = {};

// Express looks up the files relative to the static directory,
// so the name of the static directory is not part of the URL.
app.use(express.static('client'));

app.get('/', (req, res) => {
    console.log(__dirname);
    res.sendFile(__dirname + '/index.html');
  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
});


app.get('/admin', (req, res) => {
    res.sendFile(__dirname + config.adminDir + 'admin-index.html');
});

app.pvt.fileFilter = function(req, file, cb) {
    if (req.body['file-type'] === 'md' || req.body['file-type'] === 'img') {
        app.pvt.fileAccepted = true;
        cb(null, true);
    }
    else {
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
            cb(null, './public/markdown/')
        }
        else if (req.body['file-type'] === 'img') {
            cb(null, './public/images/')
        }
        else {
            // don't load file, how????
            cb(null, './public/');
        }

    },
    // server side filename for upload
    filename: function(req, file, cb) {
        // user provided name else original filename
        req.body.users_filename ? cb(null, req.body.users_filename.trim() || file.originalname) : cb(null, file.originalname);
    }
});

app.post('/admin-uploadfile', upload=multer({storage: app.pvt.storage, fileFilter: app.pvt.fileFilter}).single('admin-upload-file'), function(req, res, next){

    if (app.pvt.fileAccepted) {
        res.json( {file: 'accepted'} );
    }
    else {
        res.json( {file: 'rejected'} );
    }
});




app.get('/home', (req, res) => {
    console.log('home');
    res.sendFile(__dirname + '/index.html');
});

app.get('/uploadfile',function(req,res){
    console.log('get /uploadfile');
    res.sendFile(__dirname + "/client/html/mgmt/uploadFile.html");
});

app.get('/uploadfile1',function(req,res){
    console.log('get /uploadfile1');
    res.sendFile(__dirname + "/client/html/mgmt/uploadFile1.html");
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
      highlight: function (code, lang, callback) {
        require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
          callback(err, result.toString());
        });
      }
    });

    // Using async version of marked
    marked(markdownString, function (err, content) {
      if (err) throw err;
      console.log(content);
    });

    res.send('done');
})





app.get('/postJSON', (req, res) => {
    console.log('get postJSON');
    res.sendFile(__dirname + '/client/html/mgmt/postJSON.html');
})

app.post('/rest/jsonData', (req, res) => {
    console.log('post JSON data');
    // bodyParser handles this in req.body and returns js object
    console.log(req.body)   // js object
    jsObj = req.body
    res.send(jsObj);
});






app.get('/readwritewp', (req, res) => {
    // read, write with promises
    console.log('/readwritewp');


    var file_in = __dirname + '/md/testFile.html';
    var file_out = __dirname + '/md/testFileOut.html';

    // library to read files
    var fs = require('fs');

    var fileExist = (file_in, file_out) => {
        // does file_in exist ?
        if (!file_in || !file_out) {
            return new Promise((resolve, reject) => {
                reject('function fileExist: invalid parmaeters');
            });
        }
        return new Promise( (resolve, reject) => {
            fs.access(file_in, (err) => {
                if (err && err.code === 'ENOENT') {
                    reject('function fileExist: file ' + file_in + ' does not exist');
                }
                else {
                    resolve({file_in: file_in, file_out: file_out});
                }
            });
        });
    };


    var pathExist = (x) => {
        // does file_out path exist
        return new Promise( (resolve, reject) => {
            fs.access(require('path').dirname(file_out), function(err) {
                if (err) {
                    reject('error file_out path not exist: ' + file_out);
                }
                else {
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
        })
        var textOut = ''
        rl.on('line', function(line) {
            if (line.indexOf('<html>') < 0 && line.indexOf('</html>') < 0
            && line.indexOf('<body>') < 0 && line.indexOf('</body>') < 0) {
                // skip the line and do nothing
                // console.log(line)
                textOut = textOut + '\n' + line;
            }
        });

        var promise = new Promise((resolve, reject) => {
            // if file_in takes too long to read we generate an error
            var timer = setTimeout( () =>{
                reject('function readFile: taking too long to read file ' + x.file_in);
            },1000)

            // rl.on event is triggered when file_in eof reached
            rl.on('close', () => {
                // file_in read ok
                clearTimeout(timer);
                x.textOut = textOut;
                resolve(x)
            });
        });
        return promise;
    }

    var writeFile = (x) => {
        // write to file_out
        return new Promise((resolve, reject) => {
            fs.writeFile(x.file_out, x.textOut, (err) => {
                if (err) reject('function writeFile: error writing to ' + x.file_out);
                resolve('success');
            });
        });
    }

    fileExist(file_in, file_out)    // check file_in exists
        .then(pathExist)            // check file_out path exists
        .then(readFile)             // read file-in to eof
        .then(writeFile)            // write to file_out
        .then((x) => {res.send(x);})// shows success of chain of operations
        .catch((err) => {res.send(err);});

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
            res.send('File does not exist: ' + filename);
        }
        else {
            console.log('file exists');

            // check path to file_out exists
            // get file_out path
            fs.access(require('path').dirname(file_out), function(err) {
                if (err) {
                    // file_out path not exist
                    console.log(err.code);
                    res.send('error file_out path not exist: ' + file_out);
                }
                else {
                    // file_out path exists
                    // create readstream(physicalFileLocation)
                    var fp = fs.createReadStream(file_in);

                    // create readLine(readStream, terminal)
                    var rl = require('readline').createInterface({
                        input: fp,
                        terminal: false
                    })
                    // now we can start reading line by line
                    var textOut = ''
                    rl.on('line', function(line) {
                        if (line.indexOf('<html>') < 0 && line.indexOf('</html>') < 0
                        && line.indexOf('<body>') < 0 && line.indexOf('</body>') < 0) {
                            // skip the line and do nothing
                            // console.log(line)
                            textOut = textOut + '\n' + line;

                        }
                        // we need to write to file_out HOW TO DETECT
                    });
                    rl.on('close', function() {
                        console.log("rl.on('close'.....")
                        fs.writeFile(file_out, textOut, function(err) {
                            if (err) {
                                res.send('File cockup: ' + err.code);
                            }
                            else {
                                res.send('File read and saved ok: ' + file_in);
                            }
                        })
                    } )
                }
            } )
        }
    });
});

app.get('/writefile', (req, res) => {
    console.log('writefile')

    var filename = __dirname + '/md/writeTest.txt';

    var fs = require('fs');

    var contents = fs.writeFile(filename, "New Text to Write", function(err){
        if (err) {
            console.log('error: writing to ' + filename );
            console.log(err);
        }
        else {
            console.log('success: writing to ' + filename );
        }
    });

    res.send('File write ok: ' + filename);

});
