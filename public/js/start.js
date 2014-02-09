

function addAudioEvents(audioJq) {
	audioJq[0].addEventListener('ended', function(){
		if(PLAYHERE) { 
			commandTransmitter.nextSong()
		}
	})
	audioJq.on('play', function (e) {
		console.log('playevent')
		$("#start").find('.label').text("Pause")
		PLAYHERE = true
	});
	audioJq.on('pause', function (e) {
		// console.log('playevent')
		// $("#start").find('.label').text("Play Here")
		// PLAYHERE = false
	});
	audioJq[0].addEventListener('error', function(e) {
	//handles cannot play error by playing next song ... popup still occurs
		if(PLAYHERE) { 
			commandTransmitter.nextSong()
		}
		console.log('error with mp3')
	}, false);

}
$(document).ready(function() { 
	launchApp()
	// addAudioEvents($('audioPlayer'))
})
function launchApp() {
	squeezeText()
	commandTransmitter.onUiEvents()
	$('.hideOnStart').css('display','block')
	startSongCLIENT()
	updateShuffle()
}

var socket = io.connect(document.URL)
$(window).resize(function() {
	squeezeText()
})
socket.on('message', function (data) {
	if(data.message) {
		handleMessage(data)
	} else {
		console.log("There is a problem:", data);
	}
})
var commandTransmitter = (function () {
	function onUiEvents() {
		bindUIEvents($('#forward'),skipSong)
		bindUIEvents($('#last'),previousSong)
		bindUIEvents($('#upvote'),upvoteSong)
		bindUIEvents($('#downvote'),downvoteSong)
		bindUIEvents($('#start'),playStopToggle)
		bindUIEvents($('#off'),allOff)
		
		bindUIEvents($('#shuffleMinus'),setSuffleValue)
		bindUIEvents($('#shufflePlayed'),setSuffleValue)
		bindUIEvents($('#shuffleZero'),setSuffleValue)
		bindUIEvents($('#shuffleOne'),setSuffleValue)
		bindUIEvents($('#shuffleTwo'),setSuffleValue)
		bindUIEvents($('#shuffleSkipped'),setSuffleValue)
	}
	function allOff() {
		socket.send('AllOff')

	}
	function skipSong() {
		socket.send('Skip')

	}
	function nextSong() {
		socket.send('Next')
	}
	function previousSong() {
		socket.send('Previous')
	}
	function upvoteSong() {
		socket.send('Upvote')
	}
	function downvoteSong() {
		socket.send('Downvote')
	}
	function setSuffleValue(bb) {
		socket.send(bb.id)
	}
	return {
		onUiEvents:onUiEvents,
		nextSong:nextSong,
		previousSong:previousSong,
		upvoteSong:upvoteSong,
		upvoteSong:upvoteSong
	}
}())
function startSongCLIENT() {
	
	$.ajax({
		type: 'GET',
		headers: { "cache-control": "no-cache"},
		url: "/getSrc",
		dataType: 'json',
		success: function(url) {
			if(!url) return
			console.log(url)
			printSongInfo(url)
			getVoteCount()
			getCurrentLibrary()
			console.log(url)
			if($("#audioPlayer").length>0) {
				$("#audioPlayer")[0].src = url
				
				
				//need to .load() source before play()
				$("#audioPlayer")[0].load()
			}
			if(PLAYHERE) {
				$("#audioPlayer")[0].play()
			}
			squeezeText()
		}
	})
	function printSongInfo(rs){
		var nps = rs.split('\\')
		if(nps.length==1) {
			//osx split
			nps = rs.split('/')
		}
		if(nps.length>2) {
			var song = nps.pop().replace('Unknown','')
			var album = nps.pop().replace('Unknown','')
			var artist = nps.pop().replace('Unknown','')
			$('#albumNames').text(''+artist+'  '+album+' '+song)
		} else {
			$('#albumNames').text(rs)
		}
	}
}
function handleMessage(data) {
	console.log(data.message)
	if(data.message=='Advance') startSongCLIENT()
	if(data.message=='Previous') startSongCLIENT()
	if(data.message=='VoteUpdate') getVoteCount()
	if(data.message=='UpdateShuffle') updateShuffle()
	if(data.message=='NoMusic') alert('No mixes available.')
	if(data.message=='AllOff') turnOffSpeaker()
}
function sendUserToIndex() {
	alert(window.location)

}
function turnOffSpeaker() {
	//destory all players
	$('#audioPlayer').remove()
	PLAYHERE = false
	$("#start").find('.label').text("Play Here")
	squeezeText()
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
	.css('background','rgba(5,10,0,0.7)')
	.appendTo('body')
	var iconDivSub =  $('<div></div>')
	.css('position','absolute')
	.css('width',ctWidth)
	.css('height',ctHeight)
	.css('left',(wdth-ctWidth)/2)
	.css('top',(hght-ctHeight)/2)
	.css('background','white')
	.appendTo(iconDiv)
	.on('touchmove', function(event) {
		return false
	}) 
	var OneButtonContainer =  makeSingleContainer(iconDivSub,ctHeight-60,ctWidth*.9)
	.text(msg)
	.css('background','ghostWhite')
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
function updateShuffle() {
	$.ajax({
		type: "get",
		headers: { "cache-control": "no-cache" },
		url: "/getSuffleType",
		dataType: 'json'
	}).done(function(shuf) {
		$('.fiveRack.button').css('background-color','white')
		$('.fiveRack.button').css('color','Black')
		$.each(shuf,function(k,v) {
			if(k=='shuffleZero') {
				$('#'+k).css('background-color',shuffleZeroColor)
			}
			if(k=='shuffleMinus') {
				$('#'+k).css('background-color',shuffleMinusColor)
			}
			if(k=='shufflePlayed') {
				$('#'+k).css('background-color',shufflePlayedColor)
			}
			if(k=='shuffleSkipped'){
				$('#'+k).css('background-color',shuffleSkippedColor)
			}
			if(k=='shuffleOne') {
				$('#'+k).css('background-color',shuffleOneColor)
			}
			if(k=='shuffleTwo') {
				$('#'+k).css('background-color',shuffleTwoColor)
			}
		})
	})
}

var shuffleTwoColor = 'rgb(165,30,222)'
var shuffleOneColor = 'rgb(38,142,163)'
var shuffleSkippedColor = 'rgb(232,222,21)'
var shuffleMinusColor = 'firebrick'
var shufflePlayedColor = 'lightBlue'
var shuffleZeroColor = 'rgb(118,228,25)'
function getVoteCount() {
	$.ajax({
		type: "get",
		headers: { "cache-control": "no-cache" },
		url: "/getVoteCount",
		dataType: 'json'
	}).done(function(count) {
		var color = 'white'
		if(count==-14) {
			count = 'Skipped'
			color = shuffleSkippedColor
		}
		if(count==-4) {
			count = 'Played'
			color = shufflePlayedColor
		}
		if(count==-1) {
			count = 'Bad'
			color = shuffleMinusColor
		}
		if(count==0) {
			count = 'New'
			color = shuffleZeroColor
		}
		if(count==1) {
			count = 'Good'
			color = shuffleOneColor
		}
		if(count==2) {
			count = 'Amazing'
			color = shuffleTwoColor
		}
		$('#votelabel').text(count).parent().css('background',color)
		squeezeText()
	})
} 
function getCurrentLibrary() {
	$.ajax({
		type: "get",
		headers: { "cache-control": "no-cache" },
		url: "/getCurrentLibrary",
		dataType: 'json'
	}).done(function(lib) {
		console.log(lib)
		$('#libraryFolder').text(lib)
		squeezeText()
	})
} 
var PLAYHERE = false
function playStopToggle() {
	if(!PLAYHERE) { 
		PLAYHERE = true
		$("#start").find('.label').text("Pause")
		if($('#audioPlayer').length==0) {
			var audio = $("<audio></audio>").attr('id','audioPlayer').attr('preload','metadata').attr('controls','').appendTo('#audioCt')
			addAudioEvents(audio)
			startSongCLIENT()
		} else {
			$('#audioPlayer')[0].play()
		}
	} else {
		PLAYHERE = false
		$("#start").find('.label').text("Play Here")
		$("#audioPlayer")[0].pause()
	}
	squeezeText()
}
function bindUIEvents(jqBt,func) {
	jqBt.click(function(e){
			func(this)
			e.preventDefault()
		})
		.mouseenter(function(){
			$(this).addClass('over')
		})
		.mouseleave(function() {
			$('.button').removeClass('over').removeClass('down')
		})
		.mousedown(function(e) {
			$(this).addClass('down')
			e.preventDefault()
		})
		.mouseup(function() {
			$('.button').removeClass('down')
		})
		.dblclick(function(e) {
			e.preventDefault()
		})
	
	$('.label')
		.mousedown(function(e) {
			e.preventDefault()
		})
		.click(function(e) {
			e.preventDefault()
		})
		.dblclick(function(e) {
			e.preventDefault()
		})
}
function squeezeText() {
	$('.label').each(function() {
		var par = $(this).parent()
		heightLimit = par.height()
		labelSize = par.width()/4.5
		if(labelSize>heightLimit-20) labelSize = heightLimit -20
		$(this).css('font-size',labelSize+'px')
	})
	$('.hideOnStart').css('visibility','visible')
}