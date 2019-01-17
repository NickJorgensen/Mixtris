

var path = require('path');
var APP_ROOT = path.normalize(process.cwd())
var EventEmitter = require("events").EventEmitter;
var eventEmitter = new EventEmitter();
var Mix_Controller = require(path.join(APP_ROOT,'lib','Mix_Controller.js'))


var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require("socket.io").listen(server)


app.use('/public/js', express.static(APP_ROOT + '/public/js'))

// viewed at http://localhost:8080
server.listen(8080);

init()

function init() {
	Mix_Controller.initFoldersAndMixes(function(){
		// loadDirectoryIntoExpress()
	})
}

// eventEmitter.on("updated", function (dd) {
//     console.log("mix update occured");
// 	loadDirectoryIntoExpress()
// });

// function loadDirectoryIntoExpress() {
// 	Mix_Controller.importAllMixes(function(allMixes) {
// 		console.log("allMixes",allMixes)
// 		var keySet = Object.keys(allMixes)
// 		for (var i = 0; i < keySet.length; i++) {
// 			app.use(express.static(allMixes[keySet[i]].MUSIC_DIRECTORY))
// 		}
// 	})
// }

// io.sockets.on('connection', function (socket) {
// 	console.log('Someone connected')
//     socket.on('message', function (data) {
// 		Mix_Controller.handleSocketIOCommands(data,function(thisMessage){
// 			io.sockets.emit('message', { 
// 				message: thisMessage
// 			})
// 		})			
//     })
// })

// app.get('*',function(req,res,next) { 
// 	next()
// })
// app.get('/getSuffleType',function(req,res){
// 	Mix_Controller.getSuffleType(function(msg){
// 		res.json(msg)
// 	})
// })
// app.get('/getVoteCount',function(req,res){
// 	Mix_Controller.getVoteCount(function(msg){
// 		res.json(msg)
// 	})
// })
// app.get('/getCurrentLibrary',function(req,res){
// 	Mix_Controller.getCurrentMixFolder(function(msg){
// 		res.json(msg)
// 	})
// })
// app.get('/',function(req,res){
// 	res.set('Content-Type', 'text/html'); // 'text/html' => mime type
// 	res.sendfile(APP_ROOT + '/views/index.html')
// }) 
// app.get('/getSrc',function(req,res){
// 	Mix_Controller.getStagedUrl(function(msg){
// 		res.json(msg)
// 	})
// })
