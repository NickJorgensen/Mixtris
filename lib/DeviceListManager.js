var path = require('path');
var fs = require('fs');
var appDataPath = require('./GetAppDataPath.js').findAppDatPath()
var DEVLIST = [];
module.exports = {
	dataPath:function(ADP){
		appDataPath=ADP
		return
	},
	addToList:function(devString,cb) {
		DEVLIST.unshift(devString)
		if(DEVLIST.length>10)DEVLIST.pop()
		persistConfirmationList(DEVLIST,function() {
			// console.log(DEVLIST)
			cb(DEVLIST)
		})
	},
	isOnList:function(devString,cb) {
		if(devString=='' || !devString) {
			cb(false)
		} else {
			if(DEVLIST.length==0) {
				getDeviceListFile(function(list) {
					if (list) {
						DEVLIST = list.list
						for(var i = 0;i<DEVLIST.length;i++) {
							if(DEVLIST[i]===devString) {
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
		}
		function getDeviceListFile(cb) {
			var pth = path.join(appDataPath,"/Mixtris","deviceList.json")
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
	},
	clearDeviceList:function(cb){
		DEVLIST.length=0
		persistConfirmationList(DEVLIST,function() {
			// console.log(DEVLIST)
			cb(DEVLIST)
		})
	}
}
function persistConfirmationList(lst,cb) {
	var mixtrisJsonDefault = JSON.stringify({	
		list:lst
	}, null, 4)
	var pth = path.join(appDataPath,"/Mixtris","deviceList.json")
	fs.writeFile(pth,mixtrisJsonDefault,'utf8',function(err) {
		if (err) {
			throw err;
		} else {
			console.log('updated device list')
			cb('done')
		}
	})
}