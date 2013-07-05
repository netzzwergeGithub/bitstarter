var fs = require ('fs');
var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
var indexBuffer = fs.readFileSync("index.html");
var indexText = indexBuffer.toString();  
response.send(indexText );
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
