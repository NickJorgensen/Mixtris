var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')
var CR_LIB;
var ALL_LIB;
const asyncWalk = require('async-walk')


// paths
var allAppPaths = require('./GetAppDataPath.js')
var APPPUBLICDATAPATH = allAppPaths.findAppPublicDataPath()
let ALLMUSICFOLDERPATH = allAppPaths.findMusicFolderPath()
let MIXCATALOGSFOLDER = allAppPaths.findAppCatalogsPath()
let MIXCATALOGSFILE = allAppPaths.findAppCatalogsFilePath()

module.exports = {

	buildAllMixes: function(cb) {
		getMixeFromDisk(function(rebuildCache){
			if( rebuildCache === 0 || !rebuildCache ) rebuildCache = {}
			cb(rebuildCache)
		})
	},
	initMixtrisCatalogFolder: function(cb) {
		getMixtrisFile(function(msg){
			if(msg===0) {
				makeMixtrisAppFilesDirectory(function() {
					cb('made new mixtris app folder')
				})
			} else {
				cb(msg)
			}
		})
	},
	createOrAddToCatalogFile: function(cb) {
		var dummyMixtrisChache = {	
			SCORED_MUSIC : {},
			LAST_PLAYED_LIST : []
		}

		// check if catalog file exists
		let catalogFilePath = MIXCATALOGSFILE
		if (fs.existsSync(catalogFilePath)) {
		    
			var oldObject = JSON.parse(fs.readFileSync(catalogFilePath, 'utf8'));
			scanForNewMusic(oldObject,function(updatedMix) {
				var mixString = JSON.stringify(updatedMix, null, 4)
				saveMixtrisToDisk(mixString,function(msg){
					cb(msg)
				})
			})
		} else {
			scanForNewMusic(dummyMixtrisChache,function(updatedMix) {
				var mixString = JSON.stringify(updatedMix, null, 4)
				saveMixtrisToDisk(mixString,function(msg){
					cb(msg)
				})
			})
		}
	},
	saveAllMixesToDisk: function(allMixes,cb) {
		if(!allMixes) {
			cb('no mix')
			return
		}
		var keySet = Object.keys(allMixes)
		var counter = 0
		var len = keySet.length

		var stringMix = JSON.stringify(allMixes, null, 4)

		saveMixtrisToDisk(stringMix,function(msg){
			cb('done')
		})

	},
	saveExistingMixToDisk: function(mix,cb) {
		if(!mix) {
			cb('no mix')
			return
		}
		var stringMix = JSON.stringify(mix, null, 4)
		saveMixtrisToDisk(stringMix,function(msg){
			cb(msg)
		})
	}
}
function scanForNewMusic(mix,cb) {
	var dir = ALLMUSICFOLDERPATH
	scanDirectory(dir,function(results){
		// remove results that are not sound files
		var purgedResults = []
		for (var i = 0; i < results.length; i++) {
			let file = results[i]

			var ext = path.extname(file)
			if(ext=='.mp3' || ext=='.m4a' || ext=='.m4p') {
				purgedResults.push(file);
			}
		}

		// remove top level directory from results
		var cleanedResults = []
		for (var i = 0; i < purgedResults.length; i++) {
			var urlKey = purgedResults[i].split(ALLMUSICFOLDERPATH).pop()
			cleanedResults.push(urlKey)
		}

		// add any new results to mix
		for (var i = 0; i < cleanedResults.length; i++) {
			var url = cleanedResults[i]
			if(mix.SCORED_MUSIC[url] == undefined) {
				mix.SCORED_MUSIC[url] = 0
			}
		}

		// remove any from SCORED_MUSIC that have been deleted from folder
		let keys = Object.keys(mix.SCORED_MUSIC)
		for (var i = 0; i < keys.length; i++) {
			let urlInCatalog = keys[i]
			let foundIndex = cleanedResults.indexOf(urlInCatalog);
			if (foundIndex < 0) {
				delete mix.SCORED_MUSIC[urlInCatalog]
			}
		}

		// remove any from LAST_PLAYED_LIST that have been removed from SCORED_MUSIC in above step
		for (var i = mix.LAST_PLAYED_LIST.length - 1; i >= 0; i--) {
		    let urlInLastPlayedList = mix.LAST_PLAYED_LIST[i].url
			if(mix.SCORED_MUSIC[urlInLastPlayedList] == undefined) {
				mix.LAST_PLAYED_LIST.splice(i, 1)
			}
		}

		cb(mix)
	})
}
function getMixeFromDisk(cb){
	getMixtrisFile(function(res1){
		// make sure catalogs file exists
		if(!res1 || res1.length===0) {
			cb(0)
		} else {
			getFileFromDiskHelper(MIXCATALOGSFILE,function(ret){
				cb(ret)
			})
		}
	})
}

function getMixtrisFile(cb){
	var pth = MIXCATALOGSFOLDER
	scanDirectory(pth,function(res1){
		if(!res1) {
			cb(0)
		} else {
			cb(res1)
		}
	})
}
function saveMixtrisToDisk(mix,cb) {
	fs.writeFile(MIXCATALOGSFILE,mix,'utf8',function(err) {
		if (err) {
			throw err;
		}		
		getMixeFromDisk(function(rebuildCache){
			cb(rebuildCache)
		})
	})
}
function makeMixtrisAppFilesDirectory(ringring) {
	var pth = MIXCATALOGSFOLDER
	mkdirp(pth, function(err) { 
		if(err) throw err
		var pthMixFiles = MIXCATALOGSFOLDER
		mkdirp(pthMixFiles, function(err) { 
			if(err) throw err
			ringring('done')
		})
	})
}
function getFileFromDiskHelper(location,cb) {
	fs.readFile(location,'utf8', function (err, data) {
		if(err) {
			cb(null)
			return
		}
		if(data) {
			var pData = JSON.parse(data)
			cb(pData)
		} else {
			cb(null)
		}
	})
}
function scanDirectory(dir,cb) {
	asyncWalk(dir)
	.then(paths => {
		cb(paths)
	}).catch(function(error){
		cb(null)
	}) 
}
