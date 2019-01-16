var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')
var CR_LIB;
var ALL_LIB;
const asyncWalk = require('async-walk')

var APPPUBLICDATAPATH = require('./GetAppDataPath.js').findAppDatPath()
let ALLMUSICFOLDERPATH = path.join(APPPUBLICDATAPATH,"allMusicFolder")
let MIXFOLDERNAME = 'musicCatalogFolder'
let MIXCATALOGSFOLDER = path.join(APPPUBLICDATAPATH,MIXFOLDERNAME,"catalogs")


module.exports = {

	buildAllMixes: function(cb) {
		getAllMixesFromDisk(function(rebuildCache){
			if(rebuildCache===0||!rebuildCache)rebuildCache={}
			cb(rebuildCache)
		})
	},
	initMixtrisCatalogFolder: function(cb) {
		getMixtrisFiles(function(msg){
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
			MUSIC_DIRECTORY: ALLMUSICFOLDERPATH,
			MIXTRIS_FILE : 'catalog.json',
			SCORED_MUSIC : {},
			LAST_PLAYED_LIST : [],
			WEIGHT : 1
		}
		var fName = dummyMixtrisChache.MIXTRIS_FILE

		// check if catalog file exists
		let catalogFilePath = path.join(APPPUBLICDATAPATH,MIXFOLDERNAME,"/catalogs",dummyMixtrisChache.MIXTRIS_FILE)
		if (fs.existsSync(catalogFilePath)) {
		    
			var oldObject = JSON.parse(fs.readFileSync(catalogFilePath, 'utf8'));
			scanForNewMusic(oldObject,function(updatedMix) {
				var mixString = JSON.stringify(updatedMix, null, 4)
				saveMixtrisToDisk(dummyMixtrisChache.MIXTRIS_FILE,mixString,function(msg){
					cb(msg)
				})
			})
		} else {
			scanForNewMusic(dummyMixtrisChache,function(updatedMix) {
				var mixString = JSON.stringify(updatedMix, null, 4)
				saveMixtrisToDisk(dummyMixtrisChache.MIXTRIS_FILE,mixString,function(msg){
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
		for (var i = 0; i < len; i++) {
			if(!allMixes[keySet[i]].MIXTRIS_FILE) {
				allMixes[keySet[i]].MIXTRIS_FILE = keySet[i]
			}
			var name = allMixes[keySet[i]].MIXTRIS_FILE
			var stringMix = JSON.stringify(allMixes[keySet[i]], null, 4)
			if(!name) {
				cb('done')
				return
			}
			saveMixtrisToDisk(name,stringMix,function(msg){
				counter ++
				if(counter===len) {
					cb('done')
				}
			})
		}
	},
	saveExistingMixToDisk: function(mix,cb) {
		if(!mix) {
			cb('no mix')
			return
		}
		var name = mix.MIXTRIS_FILE
		var stringMix = JSON.stringify(mix, null, 4)
		saveMixtrisToDisk(name,stringMix,function(msg){
			cb(msg)
		})
	},
	updateWeight: function(key,weight,cb) {
		getAllMixesFromDisk(function(rebuildCache){
			var name = rebuildCache[key].MIXTRIS_FILE
			rebuildCache[key].WEIGHT = weight
			var stringMix = JSON.stringify(rebuildCache[key], null, 4)
			saveMixtrisToDisk(name,stringMix,function(msg){
				cb(msg)
			})
		})
	},
	deleteMixtrisFile: function(mixName,cb) {
		var pth = path.join(MIXCATALOGSFOLDER,mixName)
		fs.unlink(pth,function(err,msg) {
			if(err)throw err
			getAllMixesFromDisk(function(allMixes){
				cb(err,allMixes)
			})
		})
	}
}
function scanForNewMusic(mix,cb) {
	var fName = mix.MIXTRIS_FILE
	var dir = mix.MUSIC_DIRECTORY
	scanDirectory(dir,function(results){

		// remove top level directory from results
		var cleanedResults = []
		for (var i = 0; i < results.length; i++) {
			var urlKey = results[i].split(mix.MUSIC_DIRECTORY).pop()
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
function getAllMixesFromDisk(cb){
	getMixtrisFiles(function(res1){
		if(!res1) {
			cb(0)
		} else {
			if(res1.length===0){
				cb(0)
			} else {
				buildAndCacheMixFilesObject(res1,function(buildObj) {
					cb(buildObj)
				})
			}
		}
	})
}
function generateUniqueMixtrisFile(newNameVal,cb) {
	var pth = MIXCATALOGSFOLDER
	scanDirectory(pth,function(res1){
		var nameVal = newNameVal+'.json'
		var counter = 0
		cb(nameVal)
	})
}
function buildAndCacheMixFilesObject(mixFileNames,cb) {
	var resLength = mixFileNames.length
	var retTheseLib = []
	for (var i = 0; i < mixFileNames.length; i++) {
		loadLibraryFile(mixFileNames[i])
	}
	function loadLibraryFile(location) {
		if(!location) return
		getFileFromDiskHelper(location,function(ret){
			ret['MIXTRIS_LOCATION'] = location
			retTheseLib.push(ret)
			if(resLength==retTheseLib.length) {
				var builtObject = cacheMixFiles(retTheseLib)
				cb(builtObject)
			}
		})
	}
	function cacheMixFiles(arrFiles) {
		var newCacheObject = {}
		for (var i = 0; i < arrFiles.length; i++) {
			var fName = getFileNameFromPath(arrFiles[i].MIXTRIS_LOCATION)
			newCacheObject[fName]=arrFiles[i]
		}
		return newCacheObject
	}

}
function getFileNameFromPath(pString) {
	var normPath = path.normalize(pString)
	var normPathSplit = normPath.split(path.sep)
	normPathSplit = normPathSplit[normPathSplit.length-1]
	return normPathSplit
}
function getMixtrisFiles(cb){
	var pth = MIXCATALOGSFOLDER
	scanDirectory(pth,function(res1){
		if(!res1) {
			cb(0)
		} else {
			cb(res1)
		}
	})

}
function saveMixtrisToDisk(fName,mix,cb) {
	var pth = path.join(MIXCATALOGSFOLDER,fName)
	fs.writeFile(pth,mix,'utf8',function(err) {
		if (err) {
			throw err;
		}		
		getAllMixesFromDisk(function(rebuildCache){
			cb(rebuildCache)
		})
	})
}
function makeMixtrisAppFilesDirectory(ringring) {
	var pth = path.join(APPPUBLICDATAPATH, MIXFOLDERNAME)
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
		console.log(paths) 
		cb(paths)
	}).catch(function(error){
		console.log(error)
	}) 
}
