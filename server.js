var http = require('http');
var milight = require('node-milight');
var ctrl = require('node-milight')({host:'192.168.42.100',delay:100}).WhiteController;

const PORT=8037; 

function handleRequest(request, response){
    if (request.url=='/off') {
        ctrl.off(0);
        response.end('OK. Lights off.');
    } else if (request.url=='/on') {
        ctrl.on(0);
        response.end('OK. Lights on.');
    } else {
        response.end('Command not understood.');
    }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
