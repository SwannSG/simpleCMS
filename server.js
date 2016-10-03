const express = require('express');
const app = express();



app.listen(3000, function() {
  console.log('listening on 3000')
});


// Express looks up the files relative to the static directory,
// so the name of the static directory is not part of the URL.
app.use(express.static('client'));

app.get('/', (req, res) => {
    console.log(__dirname);
    res.sendFile(__dirname + '/index.html');
  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
});

app.get('/home', (req, res) => {
    console.log('home');
    res.sendFile(__dirname + '/index.html');
});

app.get('/readwritewp', (req, res) => {
    // read, write with promises
    console.log('/readwritewp');

    var file_in = __dirname + '/md/testFile.html';
    var file_out = __dirname + '/md/testFileOut.html';

    // library to read files
    var fs = require('fs');

    var fileExist = (file_in, file_out) => {
        console.log('fileExist');
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
        console.log('pathExist');
        console.log(x);
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

    var readAndWrite = (x) => {
        console.log('readAndWrite');
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

        rl.on('close', function() {
            console.log('close');
            return new Promise( (resolve, reject) => {
                resolve('ok');

                // fs.writeFile(x.file_out, textOut, function(err) {
                //     if (err) {
                //         console.log('error');
                //         reject('function readAndWrite: ' + err.code);
                //     }
                //     else {
                //         console.log('ok');
                //         x.result = 'ok'
                //         resolve(x);
                //     }
                // })


            });
        });
    }


    fileExist(file_in, file_out)
        .then(pathExist)
        .then(readAndWrite)
        .then((x) => {console.log(x); res.send(x);})
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
