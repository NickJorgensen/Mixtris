var socket = io.connect(document.URL)
var cookieMsgAbbreviated = document.cookie
$('#inner3').text(cookieMsgAbbreviated.split('-')[3])
socket.on('message', function (data) {
	if(data.message== 'Confirmed') {
		window.location.href = './'
	}
})