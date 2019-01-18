
var ALL_LIB = {};
var path = require('path');
var URLTOSTREAM;
var PREVIOUSINDEX = 0;
var returnThisMessage;
var SHUFFLE_VALUE = {shuffleZero:0};
var hasStarted = true;
var	Mix_Modeller = require('./Mix_Modeller.js');
var allAppPaths = require('./GetAppDataPath.js')

module.exports = {

	initFoldersAndMixes:function(cb) {

		// first create a folder for our music catalog
		Mix_Modeller.initMixtrisCatalogFolder(function(){

			// then scan allMusicFolder for tracks, then add them to the catalog.json file
			Mix_Modeller.createOrAddToCatalogFile(function(updatedLibrary){
				cb("done")
			})
		})

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
		if(!URLTOSTREAM || URLTOSTREAM == undefined) {
			stageNext()
			Mix_Modeller.saveExistingMixToDisk(ALL_LIB,function(){
				cb(URLTOSTREAM)
			})
		} else {
			cb(URLTOSTREAM)
		}
	},
	getVoteCount:function(cb){
		var score = 'No Score'
		if(!ALL_LIB) {
			cb(score)
		} else {
			var score = ALL_LIB.SCORED_MUSIC[URLTOSTREAM]
			console.log('returning getVoteCount score: '+score)
			cb(score)
		}
	},
	handleSocketIOCommands:function(data,cb) {
		socketIoCommandHandler(data,function(msg){
			cb(msg)
		})
	}
}
function socketIoCommandHandler(data,cb) {
	Mix_Modeller.buildAllMixes(function(allMixes){
		refreshALLMixes(allMixes)
		if(ALL_LIB==undefined || !ALL_LIB) {
			returnThisMessage = 'NoMusic'
		} else {
			if(data=='AllOff') {
				returnThisMessage = 'AllOff'
			} 
			if(data=='Skip') {
				addSkippedScore(URLTOSTREAM)
				
				stageNext()
			} 
			if(data=='Next') {
				addPlayedScore(URLTOSTREAM)
				stageNext()
			}  
			if(data=='Previous') { 
				stagePrevious()
			}  
			if(data=='Upvote') {
				if(URLTOSTREAM) {
					var url = URLTOSTREAM
					var currentScore = ALL_LIB.SCORED_MUSIC[url]
					if(currentScore<-1)currentScore = -1
					if(currentScore<2)currentScore++
					ALL_LIB.SCORED_MUSIC[url] = currentScore
					returnThisMessage = 'VoteUpdate'
				}
			}
			if(data=='Downvote') {
				if(URLTOSTREAM) {
					var url = URLTOSTREAM
					if(ALL_LIB.SCORED_MUSIC[url]==undefined)ALL_LIB.SCORED_MUSIC[url] = 0
					var currentScore = ALL_LIB.SCORED_MUSIC[url]
					if(currentScore<-1)currentScore = 0
					if(currentScore>-1) currentScore--
					ALL_LIB.SCORED_MUSIC[url] = currentScore
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

		let fileName = allAppPaths.findAppCatalogsFileName()
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
		var keySet = Object.keys(ALL_LIB.SCORED_MUSIC)
		var culledMusic = []
		var len = keySet.length
		for (var i = 0; i < keySet.length; i++) {
			var val = ALL_LIB.SCORED_MUSIC[keySet[i]]
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
Math.seededRandom = function(max, min) {
    max = max || 1;
    min = min || 0;
 
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
 
    return min + rnd * (max - min);
}
function randomToggleLibrary() {
	// DEPRECIATED
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
		throw "song not found"
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

function getPreviousCheck() {
	
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
			break
		}
	}
	if(!lastPlayedUrl) {		
		var lastOnHistoryList = sortedHistoryList[sortedHistoryList.length-1]
		lastPreviousTime = lastOnHistoryList.date
		lastPlayedUrl = lastOnHistoryList.url
	}
	return lastPlayedUrl
}
function combineAndSortPrevious() {
	var keySet = Object.keys(ALL_LIB)
	var allLastPlayedObj = {}
	var unsortedArray = []
	var lastPlayedList = ALL_LIB.LAST_PLAYED_LIST
	for (var j = 0; j < lastPlayedList.length; j++) {
		unsortedArray.push(lastPlayedList[j])
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
	ALL_LIB.LAST_PLAYED_LIST.unshift({url:url,date:newTime})
	if(ALL_LIB.LAST_PLAYED_LIST.length>500)ALL_LIB.LAST_PLAYED_LIST.pop()
}
function addPlayedScore(url) {
	if(url) {
		if(ALL_LIB.SCORED_MUSIC[url] == 0) {
			var currentScore = -4
			ALL_LIB.SCORED_MUSIC[url] = currentScore
		}
	}
}
function addSkippedScore(url) {
	if(url) {
		if(ALL_LIB.SCORED_MUSIC[url] == 0) {
			var currentScore = -14
			ALL_LIB.SCORED_MUSIC[url] = currentScore
		}
	}
}
function refreshALLMixes(mixes) {
	if(mixes===0 || !mixes) mixes = {}
	ALL_LIB = {};
	ALL_LIB = mixes;
}