var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')
var APPDATAPATH;
var MIXFOLDERNAME;
var CR_LIB;
var ALL_LIB;
var APPDATAPATH = require('./GetAppDataPath.js').findAppDatPath()

function init(cb) {
	getMixtrisFiles(function(msg){
		if(msg===0) {		
			makeMixtrisAppFilesDirectory(function() {
				cb('made new mixtris app folder')
			})
		} else {
			cb(msg)
		}
	})
}		
module.exports = function(mixFolderName){
	MIXFOLDERNAME = mixFolderName;
	return {
		buildAllMixes: function(cb) {
			getAllMixesFromDisk(function(rebuildCache){
				if(rebuildCache===0||!rebuildCache)rebuildCache={}
				cb(rebuildCache)
			})
		},
		initMixtrisAppFolder: function(cb) {
			init(function(msg){
				cb(msg)
			})
		},
		addNewMixToDisk: function(path,cb) {
			var dummyMixtrisChache = {	
				MUSIC_DIRECTORY:path,
				MIXTRIS_FILE : 'dummyName.json',
				SCORED_MUSIC : {},
				LAST_PLAYED_LIST : [],
				WEIGHT : 1
			}
			var fName = dummyMixtrisChache.MIXTRIS_FILE
			generateUniqueMixtrisFile(fName.split('.')[0],function(checkedName){
				dummyMixtrisChache.MIXTRIS_FILE = checkedName
				scanForNewMusic(dummyMixtrisChache,function(updatedMix) {
					var mixString = JSON.stringify(updatedMix, null, 4)
					saveMixtrisToDisk(checkedName,mixString,function(msg){
						cb(msg)
					})
				})
			})
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
			var pth = path.join(APPDATAPATH,MIXFOLDERNAME,"/mixtrisFiles",mixName)
			fs.unlink(pth,function(err,msg) {
				if(err)throw err
				getAllMixesFromDisk(function(allMixes){
					cb(err,allMixes)
				})
			})
		},
		saveBackupToDisk:function(selectedMixName,path,cb) {
			getAllMixesFromDisk(function(allMixes){
				if(!allMixes[selectedMixName]) {
					cb('no lib',null)
					return
				}
				var fName = getFileNameFromPath(path)
				var exportObject = allMixes[selectedMixName]
				//update this objects mixName to the saved name
				exportObject.MIXTRIS_FILE = fName
				var libString = JSON.stringify(exportObject, null, 4)
				fs.writeFile(path,libString,'utf8',function(err) {
					cb(err,'done')
				})
			})
		},
		importMixFile: function(path,cb) {
			getFileFromDiskHelper(path,function(msg) {
				var fName = msg.MIXTRIS_FILE
				generateUniqueMixtrisFile(fName.split('.')[0],function(checkedName){
					msg.MIXTRIS_FILE = checkedName
					var mixString = JSON.stringify(msg, null, 4)
					saveMixtrisToDisk(checkedName,mixString,function(msg){
						cb(msg)
					})
				})
			})
		}
	}
}
function scanForNewMusic(mix,cb) {
	var fName = mix.MIXTRIS_FILE
	var dir = mix.MUSIC_DIRECTORY
	scanDirectory(dir,function(results){
		for (var i = 0; i < results.length; i++) {
			var url = results[i].split(mix.MUSIC_DIRECTORY).pop()
			if(mix.SCORED_MUSIC[url] == undefined) {
				mix.SCORED_MUSIC[url] = 0
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
	var pth = path.join(APPDATAPATH,MIXFOLDERNAME,"/mixtrisFiles")
	scanDirectory(pth,function(res1){
		var nameVal = newNameVal+'.json'
		var counter = 0
		while(checkDup(nameVal) == false) {
			counter++
			nameVal = newNameVal+'_'+counter+'.json'
		}
		cb(nameVal)
		function checkDup(nv) {
			for (var i = 0; i < res1.length; i++) {
				var file = getFileNameFromPath(res1[i])
				if(file==nv) {
					return false
				}
			}
			return true
		}
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
	var pth = path.join(APPDATAPATH,MIXFOLDERNAME,"mixtrisFiles")
	scanDirectory(pth,function(res1){
		if(!res1) {
			cb(0)
		} else {
			cb(res1)
		}
	})

}
function saveMixtrisToDisk(fName,mix,cb) {
	var pth = path.join(APPDATAPATH,MIXFOLDERNAME,"/mixtrisFiles",fName)
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
	var pth = path.join(APPDATAPATH,MIXFOLDERNAME)
	mkdirp(pth, function(err) { 
		if(err) throw err
		var pthMixFiles = path.join(APPDATAPATH,MIXFOLDERNAME,"/mixtrisFiles")
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
	//http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
	//Asynchronous directory walking seems to crash Node-Webkit the module WALK also crashes on async, so anyway use sync file walking
	var walk = function(dir, done) {
	  var results = [];
	  fs.readdir(dir, function(err, list) {
		if (err) return done(err);
		var i = 0;
		(function next() {
		  var file = list[i++];
		  if (!file) return done(null, results);
		  file = path.join(dir,file)
		  file = path.normalize(file)
		  fs.stat(file, function(err, stat) {
			if (stat && stat.isDirectory()) {
			  walk(file, function(err, res) {
				results = results.concat(res);
				next();
			  });
			} else {
				var ext = path.extname(file)
				var fileName = file.split(path.sep)
				fileName = fileName[fileName.length-1]
				if(ext=='.mp3' || ext=='.m4a'|| ext=='.json'|| ext=='.m4p') {
					results.push(file);
				}
				next();
			}
		  });
		})();
	  })
	}
	walk(dir, function(err, results) {
		cb(results)
	})
}
