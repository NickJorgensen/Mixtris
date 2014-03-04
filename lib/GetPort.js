//http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
var http = require('http');
module.exports = {
	findPort: function(startPort,ringring) {
		var p = startPort
		getPort(p,function(foundPort){
			console.log(foundPort)
			ringring(foundPort)
		})
	}
}
function getPort(port,cb) {
	//https://gist.github.com/mikeal/1840641
	// port += 1
	var server = http.createServer()
	server.listen(port, function (err) {
		if(err) {
			// throw err
			console.log(port)
			return
		}
		server.close()
		cb(port)
	})
	server.on('error', function (err) {
		// throw err
		port += 1
		getPort(port,cb)
	})
}