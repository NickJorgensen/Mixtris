

var SHUFFLE_VALUE = {shuffleZero:0}
var URLTOSTREAM
var PREVIOUSINDEX = 0


stageLastSong()

io.sockets.on('connection', function (socket) {
	console.log('Someone connected')
    socket.on('message', function (data) {
		console.log('message recieved from server')
		handleSocketIOCommands(data)		
    })
})
function signalAllOff() {
	io.sockets.emit('message', { 
		message: 'AllOff'
	})
}

function handleSocketIOCommands(data) {
	if(ALL_LIB[CR_LIB]==undefined || !ALL_LIB[CR_LIB]) {
		io.sockets.emit('message', { 
			message: 'NoMusic'
		})
		return false
	}
	if(data=='AllOff') {
		signalAllOff()
	} 
	if(data=='Skip') {
		skipToNext()
	} 
	if(data=='Next') {
		stageNext()
	}  
	if(data=='Previous') { 
		PREVIOUSINDEX ++
		stagePrevious()
	}  
	if(data=='Upvote') {
		if(URLTOSTREAM) {
			var url = URLTOSTREAM
			var currentScore = ALL_LIB[CR_LIB].SCORED_MUSIC[url]
			if(currentScore<-1)currentScore = -1
			if(currentScore<2)currentScore++
			ALL_LIB[CR_LIB].SCORED_MUSIC[url] = currentScore
			io.sockets.emit('message', { 
				message: 'VoteUpdate'
			})
		}
	}
	if(data=='Downvote') {
		if(URLTOSTREAM) {
			var url = URLTOSTREAM
			if(ALL_LIB[CR_LIB].SCORED_MUSIC[url]==undefined)ALL_LIB[CR_LIB].SCORED_MUSIC[url] = 0
			var currentScore = ALL_LIB[CR_LIB].SCORED_MUSIC[url]
			if(currentScore<-1)currentScore = 0
			if(currentScore>-1) currentScore--
			console.log(currentScore)
			ALL_LIB[CR_LIB].SCORED_MUSIC[url] = currentScore
			io.sockets.emit('message', { 
				message: 'VoteUpdate'
			})
			// if(currentScore==-1)stageNext()
		}
	}
	if (data=='shuffleMinus' || 
		data=='shuffleZero'|| 
		data=='shuffleOne'||
		data=='shuffleTwo' ||
		data=='shuffleSkipped'
		
		) {
		if(SHUFFLE_VALUE[data]!=undefined)  {
			delete SHUFFLE_VALUE[data]
		} else {
			var val = setShuffleValue(data)
			SHUFFLE_VALUE[data] = val
		}
		io.sockets.emit('message', { 
			message: 'UpdateShuffle'
		})
	}
	library.saveMixtrisToDisk(ALL_LIB[CR_LIB].MIXTRIS_FILE,ALL_LIB[CR_LIB].MUSIC_DIRECTORY,function(){})
}
function setShuffleValue(dt) {
	if (dt=='shuffleMinus')return -1
	if (dt=='shuffleZero') return 0
	if (dt=='shuffleOne') return 1
	if (dt=='shuffleTwo') return 2
	if (dt=='shuffleSkipped') return -14
}
app.get('/getSuffleType',function(req,res){
	res.json(SHUFFLE_VALUE)
})
app.get('/getVoteCount',function(req,res){
	var score = 'No Score'
	if(!ALL_LIB[CR_LIB]) {
		res.json(score)
	} else {
		res.json(ALL_LIB[CR_LIB].SCORED_MUSIC[URLTOSTREAM])
	}
	res.json(score)
})
app.get('/getCurrentLibrary',function(req,res){
	if(ALL_LIB[CR_LIB]) {
		res.json(ALL_LIB[CR_LIB].MUSIC_DIRECTORY)
	} else {
		res.json(null)
	}
})
app.get('/',function(req,res){
	res.set('Content-Type', 'text/html'); // 'text/html' => mime type
	res.sendfile(__dirname + '/views/index.html')
}) 
app.get('/getSrc',function(req,res){
	if(!URLTOSTREAM ||URLTOSTREAM==undefined) {
		stageNext()
		res.json(URLTOSTREAM)
		return
	}
	if(!URLTOSTREAM) {
		stageNext()
	}
	res.json(URLTOSTREAM)
})
function getRandomUrl() {	
	CR_LIB = randomToggleLibrary()
	
	//protects!! against an EMPTY mix
 	if(!CR_LIB) return false
	
	var randomKey = returnRandomWithShuffleValue(SHUFFLE_VALUE)
	if(randomKey) {
		//yay 
		return randomKey
	} else {
		// no songs found with this shuffle SHUFFLE_VALUE so return any New url Good url or Amazing Url
		var dummyVal = {a:0,b:1,c:2}
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
		for (i = 0; i < keySet.length; i++) {
			val = ALL_LIB[CR_LIB].SCORED_MUSIC[keySet[i]]
			if(checkForShuffleValue(val)) culledMusic.push(keySet[i])
		}
		if(culledMusic.length>0) {
			var len = culledMusic.length
			var randNumb = Math.floor(Math.random() * (len - 0)) + 0
			return culledMusic[randNumb]
		} else {
			return null
		}
		
		function checkForShuffleValue(valIn) {
			for (j = 0; j < shuffleValueArray.length; j++) {
				if(val==shuffleValueArray[j]) return true
			}
		}
		function getShuffleValueArray(sv) {
			var keySet = Object.keys(sv)
			var returnThis = []
			var len = keySet.length
			for (i = 0; i < keySet.length; i++) {
				returnThis.push(sv[keySet[i]])
			}
			return returnThis
		}
	}
}
function randomToggleLibrary() {
	var keySet = Object.keys(ALL_LIB)
	var weightArray = [] 
	for (i = 0; i < keySet.length; i++) {
		if(ALL_LIB[keySet[i]].WEIGHT) {
			var weight = parseInt(ALL_LIB[keySet[i]].WEIGHT)
			for (j = 0; j < weight; j++) {
				weightArray.push(keySet[i])
			}
		}
	}
	var len = weightArray.length
	if(len>0) {
		var randNumb = Math.floor(Math.random() * (len - 0)) + 0
		return weightArray[randNumb]
	} else {
		//hehehe
		return keySet[0]
	}
}
function addToPreviousList(url) {
	if(url==="undefined"||!url) return
	ALL_LIB[CR_LIB].LAST_PLAYED_LIST.unshift(url)
	if(ALL_LIB[CR_LIB].LAST_PLAYED_LIST.length>500)ALL_LIB[CR_LIB].LAST_PLAYED_LIST.pop()
}
function skipToNext() {
	if(PREVIOUSINDEX===0) {
		if(URLTOSTREAM) {
			var url = URLTOSTREAM
			if(ALL_LIB[CR_LIB].SCORED_MUSIC[url] == 0) {
				var currentScore = -14
				ALL_LIB[CR_LIB].SCORED_MUSIC[url] = currentScore
			}
		}
		stageNext()
	} else {
		PREVIOUSINDEX--	
		stagePrevious()
	}	
}
function stageNext() {
	var randomSong = getRandomUrl()
	if(!randomSong)return
	if(PREVIOUSINDEX===0) {
		stageURLTOSTREAM(randomSong)
		io.sockets.emit('message', { 
			message: 'Next'
		})
		addToPreviousList(randomSong)
	} else {
		PREVIOUSINDEX--	
		stagePrevious()
	}	
}
function stagePrevious() {
	if(!ALL_LIB[CR_LIB].LAST_PLAYED_LIST[PREVIOUSINDEX]) {
			PREVIOUSINDEX--
			return
	}
	stageURLTOSTREAM(ALL_LIB[CR_LIB].LAST_PLAYED_LIST[PREVIOUSINDEX])
	io.sockets.emit('message', { 
		message: 'Previous'
	})
}
function stageLastSong() {
	//last song is found at beginning of ALL_LIB[CR_LIB].LAST_PLAYED_LIST, not at the last key
	console.log('staging last song on playlist')
	if(!ALL_LIB[CR_LIB])return
	if(!ALL_LIB[CR_LIB].LAST_PLAYED_LIST[0]) {
		stageNext()
		return
	}
	var url = ALL_LIB[CR_LIB].LAST_PLAYED_LIST[0]
	URLTOSTREAM = url
}
function stageURLTOSTREAM(url) {
	URLTOSTREAM = path.normalize(url)
}