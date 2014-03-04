
var express = require("express");
var app = express();
var EventEmitter = require("events").EventEmitter;
var eventEmitter = new EventEmitter();
var Mix_Controller = require(path.join(APP_ROOT,'lib','Mix_Controller.js'))(eventEmitter,'Mixtris')
var Device_List_Manager = require(path.join(APP_ROOT,'lib','DeviceListManager.js'))

	console.log('web.js')
	console.log(process.cwd())
	console.log('web.js')
app.configure(function(){
	app.use(express.favicon("public/js/icon.ico")); 
	app.use('/public/js', express.static(APP_ROOT + '/public/js'))
})
var io = require('socket.io').listen(app.listen(port), { log: false })

init()
function init() {
	updateBrowserAddressLink()
	Mix_Controller.makeImportAndBackupController(function(){})
	Mix_Controller.makeTableController(function(){})
	loadDirectoryIntoExpress()
}
eventEmitter.on("updated", function (dd) {
    console.log("mix update occured");
	loadDirectoryIntoExpress()
});

function updateBrowserAddressLink() {
	$('#localAddress')
	.text("http://"+ip+':'+port)
	.attr('href',"http://"+ip+':'+port)
	.click(function(e){
		gui.Shell.openExternal($(this).text())
		e.preventDefault()
	})
}
function loadDirectoryIntoExpress() {
	Mix_Controller.importAllMixes(function(allMixes) {
		console.log(allMixes)
		var keySet = Object.keys(allMixes)
		for (var i = 0; i < keySet.length; i++) {
			app.use(express.static(allMixes[keySet[i]].MUSIC_DIRECTORY))
		}
	})
}
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



app.get('*',function(req,res,next){ 
	console.log(req.headers.cookie)
	if(!req.headers.cookie) {
		console.log('cookie not found creating: '+req.headers.cookie)
		var uid = generateUUID()
		var expiration_date = new Date()
		var cookie_string = ''
		expiration_date.setFullYear(expiration_date.getFullYear() + 1)
		cookie_string = "user="+uid+"; path=/; expires=" + expiration_date.toGMTString()
		confirmDevice(uid)
		var treesHTML = fs.readFileSync(path.normalize(APP_ROOT + '/views/confirmation.html')); 
		res.set('Set-Cookie', cookie_string)
		res.writeHeader(200, {"Content-Type": "text/html"});  
		res.write(treesHTML);  
		res.end()
	} else {
		var cString = req.headers.cookie.split('=').pop()
		Device_List_Manager.isOnList(cString,function(found) {
			if (found) {
				next()
			} else {
				//reading file from disk each time prevents 304 that prevents page from loading blank when chaching is enabled ... mhhh something better maybe?
				var treesHTML = fs.readFileSync(path.normalize(APP_ROOT + '/views/confirmation.html')); 
				res.writeHeader(200, {"Content-Type": "text/html"});  
				res.write(treesHTML);  
				res.end()
				confirmDevice(cString)
			}
		})
	}
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
	res.set('Content-Type', 'text/html'); // 'text/html' => mime type
	res.sendfile(APP_ROOT + '/views/index.html')
}) 
app.get('/getSrc',function(req,res){
	Mix_Controller.getStagedUrl(function(msg){
		// console.log(msg)
		res.json(msg)
	})
})
function confirmDevice(devString) {
	function yes() {
		Device_List_Manager.addToList(devString,function(){
			io.sockets.emit('message', { 
				message: 'Confirmed'
			})
			$('.alerty').remove()
		
		})
	}
	function no() {
		$('.alerty').remove()
		return false
	}
	var msg = "Press Ok to confirm this new Connection."
	var msg2 = devString.split('-')[3]
	asyncAlert.createDialogBox(msg,msg2,yes,no)
}
function generateUUID(){
	//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};