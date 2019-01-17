


var path = require('path');
var allAppPaths = require('./lib/GetAppDataPath.js')
var APP_ROOT = allAppPaths.findAppPath()
var Mix_Controller = require(path.join(APP_ROOT,'app','lib','Mix_Controller.js'))
let ALLMUSICFOLDERPATH = allAppPaths.findMusicFolderPath()

module.exports = {
	init: function(app,express,cb) {
		Mix_Controller.initFoldersAndMixes(function(){
			Mix_Controller.importAllMixes(function(allMixes) {

				
				app.use('/public/js', express.static(APP_ROOT + '/app/public/js'))
				app.use(express.static(ALLMUSICFOLDERPATH))
				cb()
			})
		})
	},
}

