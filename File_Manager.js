var mkdirp = require('mkdirp');
var MUSIC_ROOT
var library = (function() {
	var self = {}
	function getAllLibraryFiles(cb) {
		var retTheseLib = []
		var resLength = 0
		scanDirectory(APP_ROOT+"/mixtrisFiles",function(res1){
			if(!res1) {
				makeMixtrisFilesDirectory()
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
		function makeMixtrisFilesDirectory() {
			mkdirp(APP_ROOT+"/mixtrisFiles", function(err) { 
				if(err) console.log(err)
			})
		}
		function loadLibraryFile(location) {
			if(!location) return
			getMixtrisFile(location,function(ret){
				ret['MIXTRIS_LOCATION'] = location
				retTheseLib.push(ret)
				if(resLength==retTheseLib.length) cb(retTheseLib)
			})

		}
		function getMixtrisFile(location,cb) {
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
	}
	function printLibraryNamesToConsole() {
		var ct = $('#libraryCt')
		ct.empty()
		if(ALL_LIB) {
			var indexCounter = 0
			var startTable = $('<table id="mixTable"></table>').appendTo(ct)
			$.each(ALL_LIB,function(i,k){
				console.log(this)
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
			buildDeleteButton(dt)
				
			function buildDeleteButton(attacher) {
				$('<button></button>').appendTo(attacher).attr('class','btFloat').attr('type','button').css('float','right').text('Delete').click(function(e){
					var fileName = getFileNameFromPath($(this).parent().attr('data-name'))
					deleteMixtrisFile(fileName)
				})
			}
			function buildDirectoryLabel(attacher) {
				$('<span></span>').appendTo(attacher)
				.text(data.MUSIC_DIRECTORY).css('width','50px')
				$('<button></button>').appendTo(attacher).attr('type','button').css('float','right').text('Update Directory').click(function(e){
					var fileName = getFileNameFromPath($(this).parent().attr('data-name'))
					changeDirectory(fileName)
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
	function changeDirectory(fName){
		var fInput = $('<input></input>').appendTo('body')
			.css('display','none')
			.attr('type','file')
			.attr('nwdirectory','')
			.change(function(evt) {
				var newMusicDirectory = $(this).val()
				scanMoveDirectory(newMusicDirectory,function(){
					// alert(newMusicDirectory)
					ALL_LIB[fName].MUSIC_DIRECTORY = newMusicDirectory
					saveMixtrisToDisk(fName,ALL_LIB[fName].MUSIC_DIRECTORY,function(){
						library.printLibraryNamesToConsole()
					})
				})
				fInput.remove()
			})
			fInput.trigger('click')
			function scanMoveDirectory(dir,cb) {
				scanDirectory(dir,function(results){
					var missing = []
					for (i = 0; i < results.length; i++) {
						var url = results[i].split(dir).pop()
						if(ALL_LIB[fName].SCORED_MUSIC[url] == undefined) {
							missing.push(url)
							console.log('missing')
						} else {
							console.log('found')
						}
					}
					if(missing.length>0) {
						if (window.confirm("There appears to be "+missing.length+" files missing\nWould you like to continue?")) { 
							cb('done')
						}
					} else {
						cb('done')
					}
				})
			}
	}
	function deleteMixtrisFile(file) {
		var path = APP_ROOT+"/mixtrisFiles/"+file
		if (window.confirm("Do you want to remove this mix?\nYou will loose all your ratings and mix info.")) { 
			fs.unlink(path,function(err,msg) {
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
				}
				loadDirectoryIntoExpress()
				getNewSongsFromDirectory()
			}
			cb('done')
		})
		function loadDirectoryIntoExpress(){
			$.each(ALL_LIB,function(){
				app.use(express.static(this.MUSIC_DIRECTORY))
			})
		}
		function getNewSongsFromDirectory(){
			$.each(ALL_LIB,function(){
				scanMixtrisFolderForUpdates(this.MUSIC_DIRECTORY,this.MIXTRIS_FILE,function(){
				})
			})
		}
	}
	function makeNewMix(location) {
		generateUniqueMixtrisFile(function(msg){
			saveMixtrisToDisk(msg,location,function(){
				updateMixes(function(){
					CR_LIB = randomToggleLibrary()
					printLibraryNamesToConsole()
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
		fs.writeFile(APP_ROOT+"/mixtrisFiles/"+fName,mixtrisJsonDefault,'utf8',function(err) {
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
			console.log(url)
			if(ALL_LIB[fname].SCORED_MUSIC[url] == undefined) {
				ALL_LIB[fname].SCORED_MUSIC[url] = 0
			}
		}
		cb('done')
	})
}
function generateUniqueMixtrisFile(cb) {
	scanDirectory(APP_ROOT+"/mixtrisFiles",function(res1){
		var nameVal = 'mixtris.json'
		var counter = 0
		while(checkDup(nameVal) == false) {
			counter++
			nameVal = 'mixtris'+counter+'.json'
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
	var chooser = $('#fileDialog')
	chooser.change(function(evt) {
		if(!$(this).val()) {
			cb('done')
			return
		}
		library.makeNewMix($(this).val())
		cb('done')
	});
	
	$('#ff').click(function(){
		var fInput = $('<input></input>').appendTo('body')
		.css('display','none')
		.attr('type','file')
		.attr('nwdirectory','')
		.change(function(evt) {
			if(!$(this).val()) {
				cb('done')
				return
			}
			library.makeNewMix($(this).val())
			cb('done')
			fInput.remove()
		})
		fInput.trigger('click')
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
				if(fileName === 'Mixtris.exe') alert('d')
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
