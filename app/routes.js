


var path = require('path');

var APP_ROOT = require('./lib/GetAppDataPath.js').findAppPath()
var Mix_Controller = require('./lib/Mix_Controller.js')

module.exports = {
	linkRoutesAndSocketsWithControllers: function(app,io) {
		io.sockets.on('connection', function (socket) {
			console.log('Someone connected')
		    socket.on('message', function (data) {
				Mix_Controller.handleSocketIOCommands(data,function(thisMessage){
					io.sockets.emit('message', { 
						message: thisMessage
					})
				})			
		    })
		})

		app.get('*',function(req,res,next) { 
			next()
		})
		app.get('/getSuffleType',function(req,res){
			Mix_Controller.getSuffleType(function(msg){
				res.json(msg)
			})
		})
		app.get('/getVoteCount',function(req,res){
			Mix_Controller.getVoteCount(function(msg){
				res.json(msg)
			})
		})
		app.get('/getCurrentLibrary',function(req,res){
			Mix_Controller.getCurrentMixFolder(function(msg){
				res.json(msg)
			})
		})
		app.get('/',function(req,res){
			res.set('Content-Type', 'text/html');
			res.sendfile(path.join(APP_ROOT,'app/views/index.html'))
		}) 
		app.get('/getSrc',function(req,res){
			Mix_Controller.getStagedUrl(function(msg){
				console.log("getSrc",msg)
				res.json(msg)
			})
		})
	}
}