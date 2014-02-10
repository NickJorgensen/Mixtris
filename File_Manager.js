var mkdirp = require('mkdirp');
var MUSIC_ROOT

var APPDATAPATH = getUserHome()
console.log(APPDATAPATH)
console.log(process.env)
function getUserHome() {
	// builds path to AppData in Windows and Users Library in OSX  path for application file handeling
	var rt
	if(platform == 'win32')rt = path.join(process.env['HOME'],'AppData','Local')
	if(platform == 'darwin')rt = path.join(process.env['HOME'],'Library')
	return rt;
}


var library = (function() {
	var self = {}
	function getAllLibraryFiles(cb) {
		var retTheseLib = []
		var resLength = 0
		var pth = path.join(APPDATAPATH,"/Mixtris","/mixtrisFiles")
		scanDirectory(pth,function(res1){
			if(!res1) {
				makeMixtrisAppFilesDirectory()
				cb(null)
				return
			}
			if(res1.length==0) {
				cb(null)
				return
			}
			resLength = res1.length
			for (i = 0; i < res1.length; i++) {
				loadLibraryFile(res1[i])
			}
		})
		function makeMixtrisAppFilesDirectory() {
			
			var pth = path.join(APPDATAPATH,"/Mixtris")
			mkdirp(pth, function(err) { 
				if(err) throw err
				var pthMixFiles = path.join(APPDATAPATH,"/Mixtris","/mixtrisFiles")
				mkdirp(pthMixFiles, function(err) { 
					if(err) throw err
				})
			})
		}
		function loadLibraryFile(location) {
			if(!location) return
			getFileFromDiskHelper(location,function(ret){
				ret['MIXTRIS_LOCATION'] = location
				retTheseLib.push(ret)
				if(resLength==retTheseLib.length) cb(retTheseLib)
			})

		}
	}
	function printLibraryNamesToConsole() {
		var ct = $('#libraryCt')
		ct.empty()
		if(ALL_LIB) {
			var indexCounter = 0
			var startTable = $('<table id="mixTable"></table>').appendTo(ct)
			$.each(ALL_LIB,function(i,k){
				// console.log(this)
				buildDiv(this,indexCounter)
				indexCounter ++
			})
		}
		function buildDiv(data,index) {
			var tr = $('<tr></tr>').appendTo(startTable)
			
			var dt =$('<td></td>').appendTo(tr).attr('data-name',data.MIXTRIS_FILE)
			buildWeight(dt)
			
			var dt =$('<td></td>').appendTo(tr).attr('data-name',data.MIXTRIS_FILE)
			buildDirectoryLabel(dt)
			
			var dt =$('<td></td>').appendTo(tr).attr('data-name',data.MIXTRIS_FILE)
			buildMixtrisFileName(dt)
			
			
			var dt =$('<td></td>').appendTo(tr).attr('data-name',data.MIXTRIS_FILE)
			buildSaveButton(dt)
			
			var dt =$('<td></td>').appendTo(tr).attr('data-name',data.MIXTRIS_FILE)
			buildDeleteButton(dt)
			
			function buildMixtrisFileName(attacher) {
				$('<span></span>').appendTo(attacher)
				.text(data.MIXTRIS_FILE).css('width','50px')
			}
			function buildDirectoryLabel(attacher) {
				$('<span></span>').appendTo(attacher)
				.text(data.MUSIC_DIRECTORY).css('width','50px')
			}
				
			function buildImportButton(attacher) {
				var bt = $('<button></button>').appendTo(attacher).attr('class','btFloat').attr('type','button').css('float','right').text('ImportBackup').click(function(){
					var fInput = $('<input></input>').appendTo('body')
					.css('display','none')
					.attr('type','file')
					.attr('nwsaveas','filename.json')
					.change(function(evt) {
						if(!$(this).val()) {
							return false
						}
						var fileName = getFileNameFromPath(bt.parent().attr('data-name'))
						if(!ALL_LIB[fileName]) return false
						var libString = JSON.stringify(ALL_LIB[fileName], null, 4)
						var pth = $(this).val()
						fs.writeFile(pth,libString,'utf8',function(err) {
							if (err) {
								fInput.remove()
								throw err;
							}
							fInput.remove()
							return false
						})
					})
					fInput.trigger('click')
				})
			}	
			function buildSaveButton(attacher) {
				var bt = $('<button></button>').appendTo(attacher).attr('class','btFloat').attr('type','button').css('float','right').text('Export Backup').click(function(){
					var fInput = $('<input></input>').appendTo('body')
					.css('display','none')
					.attr('type','file')
					.attr('nwsaveas','filename.json')
					.change(function(evt) {
						if(!$(this).val()) {
							return false
						}
						var fileName = getFileNameFromPath(bt.parent().attr('data-name'))
						if(!ALL_LIB[fileName]) return false
						var libString = JSON.stringify(ALL_LIB[fileName], null, 4)
						var pth = $(this).val()
						fs.writeFile(pth,libString,'utf8',function(err) {
							if (err) {
								fInput.remove()
								throw err;
							}
							fInput.remove()
							return false
						})
					})
					fInput.trigger('click')
				})
			}
			function buildDeleteButton(attacher) {
				$('<button></button>').appendTo(attacher).attr('class','btFloat').attr('type','button').css('float','right').text('Delete').click(function(e){
					var fileName = getFileNameFromPath($(this).parent().attr('data-name'))
					deleteMixtrisFile(fileName)
				})
			}
			function buildWeight(attacher) {
				$('<span></span>').appendTo(attacher).css('margin-right','10px').text('weight')
				var weight = 1
				if(data.WEIGHT) {
					weight = parseInt(data.WEIGHT)
				}
				var select = $('<select></select>').attr('id','weightSelect').appendTo(attacher).change(function(){
					var fileName = getFileNameFromPath($(this).parent().attr('data-name'))
					var val = $(this).find('option:selected').attr('value')
					ALL_LIB[fileName].WEIGHT = val
					saveMixtrisToDisk(fileName,ALL_LIB[fileName].MUSIC_DIRECTORY,function(){
						library.printLibraryNamesToConsole()
					})
				})
				select.html(
					'<option value="0">0</option>'+
					'<option value="1">1</option>'+
					'<option value="2">2</option>'+
					'<option value="3">3</option>'+
					'<option value="4">4</option>'+
					'<option value="5">5</option>'+
					'<option value="6">6</option>'+
					'<option value="7">7</option>'+
					'<option value="8">8</option>'+
					'<option value="9">9</option>'
				)
				$(select.find('option')[weight]).attr('selected','selected')
			
			}
		}
	}
	function deleteMixtrisFile(file) {
		var pth = path.join(APPDATAPATH,"/Mixtris","/mixtrisFiles",file)
		if (window.confirm("Do you want to remove this mix?\nYou will loose all your ratings and mix info.")) { 
			fs.unlink(pth,function(err,msg) {
				delete ALL_LIB[file]
				CR_LIB = randomToggleLibrary()
				printLibraryNamesToConsole()
			})
		}
	}
	function stageMix(bb) {
		var fileName = getFileNameFromPath($(bb).parent().attr('data-name'))
		saveMixtrisToDisk(fileName,ALL_LIB[fileName].MUSIC_DIRECTORY,function(){
			CR_LIB = fileName
		})
	}
	function updateMixes(cb) {
		ALL_LIB = {}
		var ct = $('#libraryCt')
		ct.empty()
		getAllLibraryFiles(function(lib){
			if(lib) {
				for (i = 0; i < lib.length; i++) {
					var fName = getFileNameFromPath(lib[i].MIXTRIS_LOCATION)
					lib[i]['MIXTRIS_FILE'] = fName
					
					ALL_LIB[fName]=lib[i]
					// console.log(lib[i])
				}
				getNewSongsFromDirectory(function(){
					loadDirectoryIntoExpress()
					console.log('all loaded')
					cb('done')
				})
			} else {
				cb('done')
			}
		})
		function loadDirectoryIntoExpress(){
			$.each(ALL_LIB,function(){
				// console.log(this.MUSIC_DIRECTORY)
				// var mDir = this.MUSIC_DIRECTORY
				// var allDir = {}
				// $.each(this.SCORED_MUSIC,function(k,v){
					// var combinedDir = mDir + k
					// var directory = path.dirname(combinedDir)
					// allDir[directory] = true
				// })
				// $.each(allDir,function(k,v){
					// console.log(k)
					// app.use(express.static(k))
				// })
				app.use(express.static(this.MUSIC_DIRECTORY))
				// console.log(this.MUSIC_DIRECTORY)
			})
		}
		function getNewSongsFromDirectory(cb){
			var counter = 0
			var countLen = Object.keys(ALL_LIB).length
			$.each(ALL_LIB,function(){
				scanMixtrisFolderForUpdates(this.MUSIC_DIRECTORY,this.MIXTRIS_FILE,function(){
					counter++
					if(counter==countLen)cb('done')
				})
			})
		}
	}
	function makeNewMix(mixName,location,cb) {
		generateUniqueMixtrisFile(mixName,function(msg){
			var newMixtrisFilName = msg 
			saveMixtrisToDisk(msg,location,function(){
				updateMixes(function(){
					CR_LIB = randomToggleLibrary()
					printLibraryNamesToConsole()
					cb(newMixtrisFilName)
				})
			})
		})
	}
	function saveMixtrisToDisk(fName,dir,cb) {
		var scored = {}
		var lastPlayed = []
		var weight = 1
		if(ALL_LIB[fName]) {
			scored = ALL_LIB[fName].SCORED_MUSIC
			lastPlayed = ALL_LIB[fName].LAST_PLAYED_LIST
			weight = ALL_LIB[fName].WEIGHT
		}
		var mixtrisJsonDefault = JSON.stringify({	
			MUSIC_DIRECTORY:dir,
			SCORED_MUSIC : scored,
			LAST_PLAYED_LIST : lastPlayed,
			WEIGHT : weight
		}, null, 4)
		var pth = path.join(APPDATAPATH,"/Mixtris","/mixtrisFiles",fName)
		fs.writeFile(pth,mixtrisJsonDefault,'utf8',function(err) {
			if (err) {
				throw err;
			}
			console.log('saved a new mixtris.json file')
			cb('done')
		})
	}

	self.saveMixtrisToDisk = saveMixtrisToDisk
	self.makeNewMix = makeNewMix
	self.getAllLibraryFiles = getAllLibraryFiles
	self.printLibraryNamesToConsole = printLibraryNamesToConsole
	self.updateMixes = updateMixes
	return self
}())
var ALL_LIB = {}
library.getAllLibraryFiles(function(msg){
	if(msg) {
		library.updateMixes(function(){
			library.printLibraryNamesToConsole()
		})
		console.log('Found Mixes')
	} else {
		console.log('no mixes found')
	}
})
function scanMixtrisFolderForUpdates(dir,fname,cb) { 
	scanDirectory(dir,function(results){
		for (i = 0; i < results.length; i++) {
			var url = results[i].split(ALL_LIB[fname].MUSIC_DIRECTORY).pop()
			if(ALL_LIB[fname].SCORED_MUSIC[url] == undefined) {
				ALL_LIB[fname].SCORED_MUSIC[url] = 0
			}
		}
		cb('done')
	})
}
function generateUniqueMixtrisFile(newNameVal,cb) {
	var pth = path.join(APPDATAPATH,"/Mixtris","/mixtrisFiles")
	scanDirectory(pth,function(res1){
		nameVal = newNameVal+'.json'
		var counter = 0
		while(checkDup(nameVal) == false) {
			counter++
			nameVal = newNameVal+'_'+counter+'.json'
		}
		cb(nameVal)
		function checkDup(nv) {
			for (i = 0; i < res1.length; i++) {
				var file = getFileNameFromPath(res1[i])
				if(file==nv) {
					return false
				}
			}
			return true
		}
	})
}
function getFileNameFromPath(pString) {
	var normPath = path.normalize(pString)
	var normPathSplit = normPath.split(path.sep)
	normPathSplit = normPathSplit[normPathSplit.length-1]
	return normPathSplit
}
initMusicDirectorySelector(function(){})
function initMusicDirectorySelector(cb) {
	$('#importFolder').click(function(){
		var fInput = $('<input></input>').appendTo('body')
		.css('display','none')
		.attr('type','file')
		.attr('nwdirectory','')
		.change(function(evt) {
			if(!$(this).val()) {
				cb('done')
				return
			}
			library.makeNewMix('mixtris',$(this).val(),function(name){})
			fInput.remove()
			cb('done')
		})
		fInput.trigger('click')
	})
	$('#importMixtrisFile').click(function(){
		var fInput2 = $('<input></input>').appendTo('body')
		.css('display','none')
		.attr('type','file')
		.attr('accept','.json')
		.change(function(evt) {
			if(!$(this).val()) {
				cb('done')
				return
			}
			console.log($(this).val())
			var pth = $(this).val()
			importedName = path.basename(pth, '.json')
			getFileFromDiskHelper(pth,function(dt){
				library.makeNewMix(importedName,dt.MUSIC_DIRECTORY,function(name){
					delete ALL_LIB[name].SCORED_MUSIC
					delete ALL_LIB[name].WEIGHT
					delete ALL_LIB[name].LAST_PLAYED_LIST
					ALL_LIB[name]['SCORED_MUSIC'] = dt.SCORED_MUSIC					
					ALL_LIB[name]['WEIGHT'] = dt.WEIGHT					
					ALL_LIB[name]['LAST_PLAYED_LIST'] = dt.LAST_PLAYED_LIST					
					library.saveMixtrisToDisk(ALL_LIB[name].MIXTRIS_FILE,ALL_LIB[name].MUSIC_DIRECTORY,function(){
					})
				})
			})
			fInput2.remove()
			cb('done')
		})
		fInput2.trigger('click')
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

// function scanMoveDirectory(dir,cb) {
	// scanDirectory(dir,function(results){
		// var missing = []
		// for (i = 0; i < results.length; i++) {
			// var url = results[i].split(dir).pop()
			// if(ALL_LIB[fName].SCORED_MUSIC[url] == undefined) {
				// missing.push(url)
				// console.log('missing')
			// } else {
				// console.log('found')
			// }
		// }
		// if(missing.length>0) {
			// if (window.confirm("There appears to be "+missing.length+" files missing\nWould you like to continue?")) { 
				// cb('done')
			// }
		// } else {
			// cb('done')
		// }
	// })
// }