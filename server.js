var http = require('http');
var milight = require('node-milight')({host:'192.168.42.100',delay:100});
var app = require('express')();
var Promise = require('promise');
var EventEmitter = require('events').EventEmitter;

const PORT=8037;
var commandReady=false;

var commandQueue = function(){
    var self = this;
    this.__proto__ = EventEmitter.prototype;
    this.q=[];
    this.counter = 0;
    this.reqInProgress=false;
    this.insert = function(command,group,val){
        var id = self.counter++; 
        self.q.push({id: id, command: command, group: group, val: val});
        if (self.q.length==1) {
            self.emit('commandReady');
        } 
        return new Promise(function(resolve,reject){
            self.on('commandComplete',function(completedId){
                if (completedId == id) resolve();
            })
        });
    };
    this.on('commandReady',function(){
        console.log("commands in q:", self.q);
        if (!self.reqInProgress && self.q.length>=1) {
            var next = self.q.shift();
            if (next && typeof next.command == 'function') {
                console.log("calling command:", next.id);
                self.reqInProgress = true;
                next.command(next.group).then(function () {
                    console.log("command called");
                    self.reqInProgress = false;
                    setTimeout(function(){self.emit('commandReady')},150);
                    self.emit('commandComplete', next.id);
                });
            }
        }
    });
};

var q = new commandQueue();

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

    console.log("group "+req.params.controller+" "+group+" - "+commandName);
    if (typeof command != 'function') res.send('Command not understood.');
    else {
        command = Promise.denodeify(command);
        q.insert(command,group,val).then(function(){
            res.send("OK, lights "+group+" "+commandName+" val: "+val);
        }).catch(function(err){
            console.error("Error sending command:",err);
            res.send("Error sending command.");
        });
    }
});

app.listen(PORT, function(){
    commandReady=true;
    console.log("Server listening on: http://localhost:%s", PORT);
});
