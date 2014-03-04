var platform = process.platform;
var path = require('path')
module.exports = {
	findAppDatPath: function() {
		var rt
		if(platform == 'win32')rt = path.join(process.env['HOME'],'AppData','Local')
		if(platform == 'darwin')rt = path.join(process.env['HOME'],'Library')
		return rt
	}
}