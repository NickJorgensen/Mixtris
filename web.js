

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
function createDialogBox(msg,func1,func2) {
		// function yes() {
			// $('.alerty').remove()
		// }
		// function no() {
			// $('.alerty').remove()
			// return false
		// }
		// var msg = "Notice:  due to auto-play restrictions on mobile devices, music must be started directly from that device.  All other controls can be done remotely after music has begun playing."
		// createDialogBox(msg,yes,null)
	var wdth = window.innerWidth || $(window).innerWidth()
	var hght = window.innerHeight || $(window).innerHeight()
	var ctWidth = wdth/3
	if(ctWidth<300)ctWidth = 300 
	var ctHeight = ctWidth*.7
	var iconDiv =  $('<div></div>')
	.attr('id','master_alert')
	.attr('class','alerty')
	.css('position','fixed')
	.css('z-index','1100000')
	.css('width',wdth)
	.css('height',hght)
	.css('left',0)
	.css('top',0)
	.css('background','rgba(250,250,250,0.3)')
	.appendTo('body')
	var iconDivSub =  $('<div></div>')
	.css('position','absolute')
	.css('width',ctWidth)
	.css('height',ctHeight)
	.css('left',(wdth-ctWidth)/2)
	.css('top',(hght-ctHeight)/2)
	.css('background','white')
	.css('outline','2px solid black')
	.appendTo(iconDiv)
	.on('touchmove', function(event) {
		return false
	}) 
	var OneButtonContainer =  makeSingleContainer(iconDivSub,ctHeight-60,ctWidth*.9)
	.text(msg)
	// .css('background','ghostWhite')
	.css('margin-top','10px')
	.css('margin-bottom','')
	.css('text-align','center')
	
	if(func2===null) {
		var btCt = $('<div></div>').appendTo(iconDivSub).css('width','150px').css('margin-left','auto').css('margin-top','10px').css('margin-right','auto')
		var bt = $('<button></button>').text('Ok').appendTo(btCt).css('width','150px').click(function(e){
		
			func1()
		})
	} else {
		
		
	}
	function makeSingleContainer(atchr,h,w) {
		if(!w) w = window.innerWidth/1.8
		var OneButtonContainer =  $('<div></div>')
			.attr('class','masterButtons')
			.css('height',h)
			.css('width',w)
			.css('margin','20px')
			.css('margin-left','auto')
			.css('margin-right','auto')
			.appendTo(atchr)
		return OneButtonContainer
	}
}
var DEVLIST = []
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
		playToNext()
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
		data=='shufflePlayed' ||
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
	if (dt=='shufflePlayed') return -4
}
function generateUUID(){
	//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};
app.get('*',function(req,res,next){ 
	if(!req.headers.cookie) {
		console.log('cookie not found creating: '+req.headers.cookie)
		var uid = generateUUID()
		var expiration_date = new Date()
		var cookie_string = ''
		expiration_date.setFullYear(expiration_date.getFullYear() + 1)
		cookie_string = "user="+uid+"; path=/; expires=" + expiration_date.toGMTString()
		// res.set('Content-Type', 'text/html')
		// res.set('Set-Cookie', cookie_string)
		// res.sendfile(APP_ROOT + '/views/confirmation.html',)
		
		var treesHTML = fs.readFileSync(path.normalize(APP_ROOT + '/views/confirmation.html')); 
		res.set('Set-Cookie', cookie_string)
		res.writeHeader(200, {"Content-Type": "text/html"});  
		res.write(treesHTML);  
		res.end()
	} else {
		var cString = req.headers.cookie.split('=').pop()
		isOnList(cString,function(found) {
			if (found) {
				next()
			} else {
				//reading file from disk each time prevents 304 that prevents page from loading blank when chaching is enabled ... mhhh something better maybe?
				var treesHTML = fs.readFileSync(path.normalize(APP_ROOT + '/views/confirmation.html')); 
				res.writeHeader(200, {"Content-Type": "text/html"});  
				res.write(treesHTML);  
				res.end()
				confirmDevice(cString)
			}
		})
	}
})
function isOnList(devString,cb) {
	if(DEVLIST.length==0) {
		getDeviceListFile(function(list) {
			if (list) {
				console.log(devString)
				DEVLIST = list.list
				console.log(DEVLIST)
				for(var i = 0;i<DEVLIST.length;i++) {
					if(DEVLIST[i]==devString) {
						cb(true)
						return
					}		
				}
				cb(false)
				return
			} else {
				cb(false)
				return
			}
		})
	} else {
		for(var i = 0;i<DEVLIST.length;i++) {
			if(DEVLIST[i]==devString) {
				cb(true)
				return
			}		
		}
		cb(false)
		return
	}
	function getDeviceListFile(cb) {
		var pth = path.join(APPDATAPATH,"/Mixtris","deviceList.json")
		fs.readFile(pth,'utf8', function (err, data) {
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

function confirmDevice(devString) {
	function yes() {
		$('.alerty').remove()
		DEVLIST.unshift(devString)
		if(DEVLIST.length>10)DEVLIST.pop()
		persistConfirmationList(DEVLIST)
		io.sockets.emit('message', { 
			message: 'Confirmed'
		})
	}
	function no() {
		$('.alerty').remove()
		return false
	}
	var msg = "Press Ok to confirm this new Connection."
	createDialogBox(msg,yes,null)
}
function persistConfirmationList(lst) {
	var mixtrisJsonDefault = JSON.stringify({	
		list:lst
	}, null, 4)
	var pth = path.join(APPDATAPATH,"/Mixtris","deviceList.json")
	fs.writeFile(pth,mixtrisJsonDefault,'utf8',function(err) {
		if (err) {
			throw err;
		} else {
			console.log('updated device list')
			var pData = JSON.parse(mixtrisJsonDefault)
		}
	})
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
	res.sendfile(APP_ROOT + '/views/index.html')
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
		// no songs found with this shuffle SHUFFLE_VALUE so return any New url Good url or Amazing Url or Played Url
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
function playToNext() {
	if(PREVIOUSINDEX===0) {
		if(URLTOSTREAM) {
			var url = URLTOSTREAM
			if(ALL_LIB[CR_LIB].SCORED_MUSIC[url] == 0) {
				var currentScore = -4
				ALL_LIB[CR_LIB].SCORED_MUSIC[url] = currentScore
			}
		}
		stageNext()
	} else {
		PREVIOUSINDEX--	
		stagePrevious()
	}	
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
			message: 'Advance'
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