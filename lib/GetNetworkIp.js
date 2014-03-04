//http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
var os=require('os');
var ifaces=os.networkInterfaces();

module.exports = {
	getIp: function() {
		var ip;
		for (var dev in ifaces) {
		  ifaces[dev].forEach(function(details){
			if (details.family=='IPv4' && details.internal==false) {
			  ip = details.address
			  return
			}
		  });
		}
		return ip
	}
}