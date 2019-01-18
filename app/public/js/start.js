

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
		// $("#start").find('.label').text("Play")
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
	addAudioEvents($('#audioPlayer'))
})
function launchApp() {
	squeezeText()
	commandTransmitter.onUiEvents()
	$('.hideOnStart').css('display','block')
	startSongCLIENT()
	updateShuffle()
}

// var socket = io.connect(document.URL)
 var socket = io();
$(window).resize(function() {
	squeezeText()
})
socket.on('message', function (data) {
	console.log('got message')
	console.log(data)
	console.log('got message')
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
			printSongInfo(url)
			getVoteCount()
			// getCurrentLibrary()
			$("#audioPlayer")[0].src = url
			//must load new src or safari won't play
			$("#audioPlayer")[0].load()
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
	if(data.message=='NoMusic') {
		// alert('No mixes available.')
	}
	if(data.message=='AllOff') turnOffSpeaker()
}
function turnOffSpeaker() {
	//destory all players
	// $('#audioPlayer').removeAttr('controls','hidden')
	$('#audioPlayer')[0].pause()
	
	PLAYHERE = false
	$("#start").find('.label').text("Play")
	$("#start").css('color','darkgreen')
	squeezeText()
}
function updateShuffle() {
	$.ajax({
		type: "get",
		headers: { "cache-control": "no-cache" },
		url: "/getSuffleType",
		dataType: 'json'
	}).done(function(shuf) {
		$('.fiveRack.button').css('background-color','rgba(255,255,255,1)')
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

var shuffleTwoColor = 'rgb(38,142,163)'
var shuffleOneColor = 'rgb(150,150,198)'
var shuffleSkippedColor = 'rgb(232,222,21)'
var shuffleMinusColor = 'firebrick'
var shufflePlayedColor = 'lightBlue'
var shuffleZeroColor = 'rgb(50,142,100)'
function getVoteCount() {
	$.ajax({
		type: "get",
		headers: { "cache-control": "no-cache" },
		url: "/getVoteCount",
		dataType: 'json'
	}).done(function(count) {
		var color = 'white'
		var txt
		if(count==-14) {
			txt = 'Skipped'
			color = shuffleSkippedColor
		}
		if(count==-4) {
			txt = 'Played'
			color = shufflePlayedColor
		}
		if(count==-1) {
			txt = 'Bad'
			color = shuffleMinusColor
		}
		if(count==0) {
			txt = 'New'
			color = shuffleZeroColor
		}
		if(count==1) {
			txt = 'Good'
			color = shuffleOneColor
		}
		if(count==2) {
			txt = 'Amazing'
			color = shuffleTwoColor
			// $('#votelabel').parent().css('background-image','paper.gif')"
		}
		var labelJq = $('#votelabel')
		labelJq.text(txt).parent().css('background',color)
		squeezeText()
	})
}



function getCurrentLibrary() {
	// depreciated
	$.ajax({
		type: "get",
		headers: { "cache-control": "no-cache" },
		url: "/getCurrentLibrary",
		dataType: 'json'
	}).done(function(lib) {
		var splitPath = lib.split("/");
		$('#libraryFolder').text(splitPath[splitPath.length - 1])
		squeezeText()
	})
} 
var PLAYHERE = false
function playStopToggle() {
	if(!PLAYHERE) { 
		PLAYHERE = true
		$("#start").find('.label').text("Pause")
		$("#start").css('color','black')
		
		// $('#audioPlayer').attr('controls','')
		$('#audioPlayer')[0].play()
	} else {
		PLAYHERE = false
		$("#start").find('.label').text("Play")
		$("#start").css('color','darkgreen')
		$("#audioPlayer")[0].pause()
		// $('#audioPlayer').removeAttr('controls','hidden')
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