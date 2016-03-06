var express = require('express');
var browserify = require('browserify-middleware');
var app = express();

app.use('/', express.static(__dirname + '/static'));
app.use('/client', browserify(__dirname + '/client'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap'));

app.listen(8000, function () {
    console.log('Started listening on port 3000!');
});
