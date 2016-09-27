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
