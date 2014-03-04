

var $ = require('../public/js/jquery-1.10.2.js')
var Mix_Viewer = require('./Mix_Viewer.js');
var asyncAlert = require('./AsyncAlertMod.js');
var ALL_LIB = {};
var CR_LIB;
var path = require('path');
var URLTOSTREAM;
var PREVIOUSINDEX = 0;
var returnThisMessage;
var SHUFFLE_VALUE = {shuffleZero:0};
var hasStarted = true;
var event;
//start up app data folder if none exists
var Mix_Modeller
module.exports = function(ev,AppDataFolder){
	Mix_Modeller = require('./Mix_Modeller.js')(AppDataFolder);
	Mix_Modeller.initMixtrisAppFolder(function(){})
	event = ev;
	return {
		makeTableController:function(cb) {
			Mix_Modeller.buildAllMixes(function(allMixes){
				bindAllTables(allMixes)
				cb(allMixes)
			})
		},
		makeImportAndBackupController:function(cb) {
			var pass = bindImportAndBackup()
			cb(pass)
		},
		addNewMixToAppData:function(dir,ev) {
			addNewMixToAppData(dir,ev)
		},
		importMixToAppData:function(dir,ev) {
			importMixToAppData(dir,ev)
		},
		importAllMixes:function(cb) {
			Mix_Modeller.buildAllMixes(function(allMixes){
				refreshALLMixes(allMixes)
				cb(allMixes)
			})
		},
		getSuffleType:function(cb) {
			cb(SHUFFLE_VALUE)
		},
		getStagedUrl:function(cb){
			if(!URLTOSTREAM ||URLTOSTREAM==undefined) {
				stageNext()
				Mix_Modeller.saveExistingMixToDisk(ALL_LIB[CR_LIB],function(){
					cb(URLTOSTREAM)
				})
			} else {
				cb(URLTOSTREAM)
			}
		},
		getVoteCount:function(cb){
			var score = 'No Score'
			if(!ALL_LIB[CR_LIB]) {
				cb(score)
			} else {
				var score = ALL_LIB[CR_LIB].SCORED_MUSIC[URLTOSTREAM]
				console.log('returning getVoteCount score: '+score)
				cb(score)
			}
		},
		getCurrentMixFolder:function(cb){
			if(ALL_LIB[CR_LIB]) {
				cb(ALL_LIB[CR_LIB].MUSIC_DIRECTORY)
			} else {
				cb(null)
			}
		},
		handleSocketIOCommands:function(data,cb) {
			socketIoCommandHandler(data,function(msg){
				cb(msg)
			})
		}
	}
}
function socketIoCommandHandler(data,cb) {
	Mix_Modeller.buildAllMixes(function(allMixes){
		refreshALLMixes(allMixes)
		if(ALL_LIB[CR_LIB]==undefined || !ALL_LIB[CR_LIB]) {
			returnThisMessage = 'NoMusic'
		} else {
			if(data=='AllOff') {
				returnThisMessage = 'AllOff'
			} 
			if(data=='Skip') {
				console.log('skipping to next')
				addSkippedScore(URLTOSTREAM)
				
				stageNext()
			} 
			if(data=='Next') {
				console.log('auto playing to next')
				addPlayedScore(URLTOSTREAM)
				stageNext()
			}  
			if(data=='Previous') { 
				stagePrevious()
			}  
			if(data=='Upvote') {
				if(URLTOSTREAM) {
					var url = URLTOSTREAM
					var currentScore = ALL_LIB[CR_LIB].SCORED_MUSIC[url]
					if(currentScore<-1)currentScore = -1
					if(currentScore<2)currentScore++
					ALL_LIB[CR_LIB].SCORED_MUSIC[url] = currentScore
					returnThisMessage = 'VoteUpdate'
				}
			}
			if(data=='Downvote') {
				if(URLTOSTREAM) {
					var url = URLTOSTREAM
					if(ALL_LIB[CR_LIB].SCORED_MUSIC[url]==undefined)ALL_LIB[CR_LIB].SCORED_MUSIC[url] = 0
					var currentScore = ALL_LIB[CR_LIB].SCORED_MUSIC[url]
					if(currentScore<-1)currentScore = 0
					if(currentScore>-1) currentScore--
					ALL_LIB[CR_LIB].SCORED_MUSIC[url] = currentScore
					returnThisMessage = 'VoteUpdate'
				}
			}
			if (data=='shuffleMinus' || 
				data=='shuffleZero'|| 
				data=='shuffleOne'||
				data=='shuffleTwo' ||
				data=='shufflePlayed' ||
				data=='shuffleSkipped') {
					if(SHUFFLE_VALUE[data]!=undefined)  {
						delete SHUFFLE_VALUE[data]
					} else {
						var val = setShuffleValue(data)
						SHUFFLE_VALUE[data] = val
					}
					returnThisMessage = 'UpdateShuffle'
			}
		}
		Mix_Modeller.saveAllMixesToDisk(ALL_LIB,function(){
			cb(returnThisMessage)
		})
	})
}

function setShuffleValue(dt) {
	if (dt=='shuffleMinus')return -1
	if (dt=='shuffleZero') return 0
	if (dt=='shuffleOne') return 1
	if (dt=='shuffleTwo') return 2
	if (dt=='shuffleSkipped') return -14
	if (dt=='shufflePlayed') return -4
}
function getRandomUrl() {
	CR_LIB = randomToggleLibrary()
	//protects!! against an EMPTY mix
 	if(!CR_LIB) return false
	var randomKey = returnRandomWithShuffleValue(SHUFFLE_VALUE)
	if(randomKey) {
		//that was easy
		return randomKey
	} else {
		// no songs found with this SHUFFLE_VALUE so return any New url, Good url, Amazing Url, or Played Url
		var dummyVal = {a:0,b:1,c:2,d:-4}
		var randomKey1 = returnRandomWithShuffleValue(dummyVal)
		if(randomKey1) {
			return randomKey1
		} else {
			// edge case where there are only skipped values so return a skipped value
			var dummyVal = {a:-14}
			var randomKey2 = returnRandomWithShuffleValue(dummyVal)
			if(randomKey2) {
				return randomKey2
			} else {
				console.log("NOTHING FOUND!!!")
			}
		}
	}
	function returnRandomWithShuffleValue(shuffleValues) {	
		var shuffleValueArray = getShuffleValueArray(shuffleValues)
		var keySet = Object.keys(ALL_LIB[CR_LIB].SCORED_MUSIC)
		var culledMusic = []
		var len = keySet.length
		for (var i = 0; i < keySet.length; i++) {
			var val = ALL_LIB[CR_LIB].SCORED_MUSIC[keySet[i]]
			if(checkForShuffleValue(val)) culledMusic.push(keySet[i])
		}
		if(culledMusic.length>0) {
			var len = culledMusic.length
			var randNumb = Math.floor(Math.seededRandom() * (len - 0)) + 0
			return culledMusic[randNumb]
		} else {
			return null
		}
		
		function checkForShuffleValue(valIn) {
			for (var j = 0; j < shuffleValueArray.length; j++) {
				if(val==shuffleValueArray[j]) return true
			}
		}
		function getShuffleValueArray(sv) {
			var keySet = Object.keys(sv)
			var returnThis = []
			var len = keySet.length
			for (var i = 0; i < keySet.length; i++) {
				returnThis.push(sv[keySet[i]])
			}
			return returnThis
		}
	}
}
Math.seed = 6;
 //http://indiegamr.com/generate-repeatable-random-numbers-in-js/
// in order to work 'Math.seed' must NOT be undefined,
// so in any case, you HAVE to provide a Math.seed
Math.seededRandom = function(max, min) {
    max = max || 1;
    min = min || 0;
 
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
 
    return min + rnd * (max - min);
}
function randomToggleLibrary() {
	var keySet = Object.keys(ALL_LIB)
	var weightArray = [] 
	for (var i = 0; i < keySet.length; i++) {
		if(ALL_LIB[keySet[i]].WEIGHT) {
			var weight = parseInt(ALL_LIB[keySet[i]].WEIGHT)
			for (var j = 0; j < weight; j++) {
				weightArray.push(keySet[i])
			}
		}
	}
	var len = weightArray.length
	if(len>0) {
		var randNumb = Math.floor(Math.seededRandom() * (len - 0)) + 0
		return weightArray[randNumb]
	} else {
		//hehehe
		return keySet[0]
	}
}
function stageNext() {
	var prev = getPreviousCheck()
	if (prev) {
		console.log('next found previous')
		var randomSong = prev
	} else {
		console.log('next getting random')
		var randomSong = getRandomUrl()
		lastPreviousTime = setNewTime()
		addToPreviousList(randomSong)
	}
	if(!randomSong){
		throw err
		return
	}
	stageURLTOSTREAM(randomSong)
	returnThisMessage = 'Advance'
}
function stagePrevious() {
	var stagePrev = getPrevious()
	if(!stagePrev) return 
	stageURLTOSTREAM(stagePrev)
	returnThisMessage = 'Previous'
}
function setNewTime() {
	var date = new Date();
	var timeInMilli = date.getTime();
	return timeInMilli
}
var lastPreviousTime = 1000000000000000 //a long time from now
function checkLegacy() {
	var keySet = Object.keys(ALL_LIB)
	var allLastPlayedObj = {}
	var unsortedArray = []
	for (var i = 0; i < keySet.length; i++) {
		var lastPlayedList = ALL_LIB[keySet[i]].LAST_PLAYED_LIST
		for (var j = 0; j < lastPlayedList.length; j++) {
			unsortedArray.push(lastPlayedList[j])
			if(lastPlayedList[j].date) {
				return true
			}
		}
		ALL_LIB[keySet[i]].LAST_PLAYED_LIST.length = 0
	}
	return false
}
function getPreviousCheck() {
	// if(!checkLegacy()) {
		// return
	// }
	
	var lastPlayedUrl;
	var sortedHistoryList = combineAndSortPrevious()
	if(sortedHistoryList.length<1) {
		return false
	}
	//invert list and walk backwark until a later date is found
	for (var i = sortedHistoryList.length-1; i >= 0; i--) {
		if(sortedHistoryList[i].date>lastPreviousTime) {
			lastPreviousTime = sortedHistoryList[i].date
			lastPlayedUrl = sortedHistoryList[i].url
			CR_LIB = sortedHistoryList[i].CR_LIB
			break
		}
	}
	return lastPlayedUrl
}
function getPrevious() {
	//combine  previous lisst 
	var lastPlayedUrl;
	var sortedHistoryList = combineAndSortPrevious()
	if(sortedHistoryList.length<1) {
		returnThisMessage = 'NoMusic'
		return
	}
	for (var i = 0; i < sortedHistoryList.length; i++) {
		var date = sortedHistoryList[i].date
		var url = sortedHistoryList[i].url
		if(date<lastPreviousTime) {
			lastPreviousTime = date
			lastPlayedUrl = url
			CR_LIB = sortedHistoryList[i].CR_LIB
			break
		}
	}
	if(!lastPlayedUrl) {		
		var lastOnHistoryList = sortedHistoryList[sortedHistoryList.length-1]
		lastPreviousTime = lastOnHistoryList.date
		lastPlayedUrl = lastOnHistoryList.url
		CR_LIB = lastOnHistoryList.CR_LIB
	}
	return lastPlayedUrl
}
function combineAndSortPrevious() {
	var keySet = Object.keys(ALL_LIB)
	var allLastPlayedObj = {}
	var unsortedArray = []
	for (var i = 0; i < keySet.length; i++) {
		var lastPlayedList = ALL_LIB[keySet[i]].LAST_PLAYED_LIST
		for (var j = 0; j < lastPlayedList.length; j++) {
			unsortedArray.push(lastPlayedList[j])
		}
	}
	unsortedArray.sort(function(a, b){
		return b.date-a.date
	})
	return unsortedArray
}
function stageURLTOSTREAM(url) {
	URLTOSTREAM = path.normalize(url)
}
function addToPreviousList(url) {
	var newTime = setNewTime()
	if(url==="undefined"||!url) {
		return
	}
	ALL_LIB[CR_LIB].LAST_PLAYED_LIST.unshift({url:url,date:newTime,CR_LIB:CR_LIB})
	if(ALL_LIB[CR_LIB].LAST_PLAYED_LIST.length>500)ALL_LIB[CR_LIB].LAST_PLAYED_LIST.pop()
}
function addPlayedScore(url) {
	if(url) {
		if(ALL_LIB[CR_LIB].SCORED_MUSIC[url] == 0) {
			var currentScore = -4
			ALL_LIB[CR_LIB].SCORED_MUSIC[url] = currentScore
		}
	}
}
function addSkippedScore(url) {
	if(url) {
		if(ALL_LIB[CR_LIB].SCORED_MUSIC[url] == 0) {
			var currentScore = -14
			ALL_LIB[CR_LIB].SCORED_MUSIC[url] = currentScore
		}
	}
}
function refreshALLMixes(mixes) {
	if(mixes===0 || !mixes) mixes = {}
	ALL_LIB = {};
	ALL_LIB = mixes;
	if(!ALL_LIB[CR_LIB]){
		CR_LIB = randomToggleLibrary()
	}
}
function addNewMixToAppData(dir) {
	if(!dir) return
	Mix_Modeller.addNewMixToDisk(dir,function(updatedLibrary){
		event.emit("updated",updatedLibrary);
		bindAllTables(updatedLibrary)
	})
}
function importMixToAppData(dir) {
	if(!dir) return
	Mix_Modeller.importMixFile(dir,function(updatedLibrary){
		event.emit("updated",updatedLibrary);
		bindAllTables(updatedLibrary)
	})
}
function bindImportAndBackup(ev) {
	$('#importNewFolder').click(function(){
		var fInput = Mix_Viewer.makeSaveHiddenInput()
		fInput.change(function() {
			fInput.remove()
			addNewMixToAppData($(this).val(),ev)
		})
		fInput.trigger('click')
	})
	$('#importBackup').click(function(){
		var fInput2 = Mix_Viewer.makeImportHiddenInput()
		fInput2.change(function() {
			fInput2.remove()
			importMixToAppData($(this).val(),ev)
		})
		fInput2.trigger('click')
	})
	return 'pass'
}
function bindAllTables(allMixes) {
	var ct = $('#libraryCt')
	ct.empty()
	if(allMixes) {
		var ct = $('#libraryCt')
		var table = Mix_Viewer.makeTable(ct)
		$.each(allMixes,function(i,k){
			buildTableRow(this)
		})
	}
	function buildTableRow(data) {
		var tr = Mix_Viewer.makeTableRow(table)
		var weight = Mix_Viewer.buildWeight(tr,data)
		weight.change(function(){
			var fileName = $(this).parent().attr('data-name')
			var val = $(this).find('option:selected').attr('value')
			Mix_Modeller.updateWeight(fileName,val,function(updatedLibrary){
				bindAllTables(updatedLibrary)
			})
		})
		Mix_Viewer.buildMixtrisFileName(tr,data)	
		Mix_Viewer.buildDirectoryLabel(tr,data)
		
		var delButton = Mix_Viewer.buildDeleteButton(tr,data)
		delButton.click(function(e){
			var fileName = $(this).parent().attr('data-name')
			deleteMixtrisFile(fileName)
		})
		function deleteMixtrisFile(file) {
			function yes() {
				$('.alerty').remove()
				Mix_Modeller.deleteMixtrisFile(file,function(err,msg){
					if (err) {
						throw err;
					}
					bindAllTables(msg)
					return false
				})
			}
			function no() {
				$('.alerty').remove()
				return false
			}
			var msg = "would you like to delete this folders mix."
			var msg2 = ''
			asyncAlert.createDialogBox(msg,msg2,yes,no)
		}
		var saveButton = Mix_Viewer.buildSaveButton(tr,data)
		saveButton.click(function(){
			var fInput = $('<input></input>').appendTo('body')
			.css('display','none')
			.attr('type','file')
			.attr('nwsaveas','filename.json')
			.change(function() {
				if(!$(this).val()) {
					return false
				}
				var pth = $(this).val()
				var selectedMixName = saveButton.parent().attr('data-name')
				Mix_Modeller.saveBackupToDisk(selectedMixName,pth,function(err,msg){
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
}