var platform = process.platform;
var path = require('path')
let MIXFOLDERNAME = (process.env.NODE_ENV == 'test') ? 'musicCatalogFolder_Test' : 'musicCatalogFolder'
let MUSICFOLDERNAME = (process.env.NODE_ENV == 'test') ? 'allMusicFolder_Test' : 'allMusicFolder'
let CATALOGFOLDERNAME = (process.env.NODE_ENV == 'test') ? 'catalogs_Test' : 'catalogs'
let CATALOGFILENAME = (process.env.NODE_ENV == 'test') ? 'catalog_Test.json' : 'catalog.json'

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
	findAppCatalogsParentPath: function() {
		
		var appPublicPath = this.findAppPublicDataPath()

		let appCatalogsParentPath = path.join(appPublicPath,MIXFOLDERNAME)

		return appCatalogsParentPath
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