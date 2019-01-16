var platform = process.platform;
var path = require('path')
module.exports = {
	findAppDatPath: function() {
		
		var appPath = path.normalize(process.cwd())
		var pth = path.join(appPath,"/public")

		return pth
	}
}