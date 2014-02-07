var socket = io.connect(document.URL)
socket.on('message', function (data) {
	if(data.message== 'Confirmed') {
		window.location.href = './'
	}
})