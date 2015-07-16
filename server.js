var http = require('http');
var milight = require('node-milight')({host:'192.168.42.100',delay:100});
var app = require('express')(); 

const PORT=8037;

app.get('/',function(req,res){
    res.send('Command not understood.');
});

app.get('/:controller/:group/:command/:val?',function(req,res) {
    var commandName = req.params.command;
    var controller = (req.params.controller=='w')? milight.WhiteController 
      : (req.params.controller=='rgbw')? milight.RGBWController : {};
    var command = controller[commandName];
    var group = parseInt(req.params.group) || 0;
    var val = parseInt(req.params.val) || null;
    if (typeof command != 'function') res.send('Command not understood.');
    else {
        command(group,function(err){
            if (err) throw err;
            res.send("OK, lights "+group+" "+commandName+" val: "+val);
        });
    }
});

app.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
