
var main = require('./app/main.js')
var route = require('./app/routes.js')
var Mix_Controller = require('./app/lib/Mix_Controller.js')


var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require("socket.io").listen(server)

main.init(app,express,function(){
	route.linkRoutesAndSocketsWithControllers(app,io)
	server.listen(8080);
})
