//http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
var os=require('os');
var ifaces=os.networkInterfaces();
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4' && details.internal==false) {
      console.log(details.address);
	  $('#localAddress').attr('href','http://www.w3schools.com')
	  $('#localAddress').text("http://"+details.address+':'+port)
      ++alias;
    }
  });
}