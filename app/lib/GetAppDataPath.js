var platform = process.platform;
var path = require('path')
let MIXFOLDERNAME = 'musicCatalogFolder'
let MUSICFOLDERNAME = 'allMusicFolder'
let CATALOGFOLDERNAME = 'catalogs'
let CATALOGFILENAME = 'catalog.json'
console.log("process.env.NODE_ENV",process.env.NODE_ENV)
module.exports = {
	findAppPath: function() {
		var appPath = path.normalize(process.cwd())
		return appPath
	},
	findAppPublicDataPath: function() {
		
		var appPublicPath = path.normalize(process.cwd())
		var pth = path.join(appPublicPath,'app','/public')

		return pth
	},
	findAppCatalogsPath: function() {
		
		var appPublicPath = this.findAppPublicDataPath()

		let appCatalogsPath = path.join(appPublicPath,MIXFOLDERNAME,CATALOGFOLDERNAME)

		return appCatalogsPath
	},
	findAppCatalogsFilePath: function() {
		
		var catalogsPath = this.findAppCatalogsPath()

		let appCatalogsFile = path.join(catalogsPath,CATALOGFILENAME)

		return appCatalogsFile
	},

	findAppCatalogsFileName: function() {
		
		return CATALOGFILENAME
	},


	findMusicFolderPath: function() {
		
		var appPublicPath = this.findAppPublicDataPath()

		let musicFolderPath = path.join(appPublicPath,MUSICFOLDERNAME)

		return musicFolderPath
	},
	
}