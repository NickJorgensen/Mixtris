
var assert = require('assert');
var path = require('path');
var mkdirp = require('mkdirp')
var async = require("async");
var fs = require('fs')



var allAppPaths = require('../../lib/GetAppDataPath.js')
var APP_ROOT = allAppPaths.findAppPath()
var Mix_Controller = require('../../lib/Mix_Controller.js')
var	Mix_Modeller = require('../../lib/Mix_Modeller.js');
var rimraf = require("rimraf");


describe('IT for Mix_Controller.js', function() {


	before(function() {
	    // remove all test music folders and catalog folders then add a music folder to simulate a user adding music to their allMusicFolder
		return new Promise((resolve, reject) => {
			cleanMusicAndCatalogFolderThenAddMusic(function(err,msg){
				if (err) reject()
				resolve();
			})
		});
	});

	describe('Start testing Mix_Controller.js', function() {

		it('Sanity check to confirm catalog folder does not exist', function() {
			let testCatalogParentPath = allAppPaths.findAppCatalogsParentPath()
			var doesExist = fs.existsSync(testCatalogParentPath)
			assert.equal(doesExist, false);
		});

		it('kick things off by initializinf folders and mixes', function(done) {
			Mix_Controller.initFoldersAndMixes(function(msg){
				assert('SCORED_MUSIC' in msg);
				let keys = Object.keys(msg.SCORED_MUSIC)
				assert.equal(keys.length,10)
				
				done()
			})
		});

		it('get shuffle type on brand new library', function(done) {
			Mix_Controller.getSuffleType(function(val){
				assert.equal((val != null),true)
				done()
			})
		});

		it('get staged url on brand new library', function(done) {
			Mix_Controller.getStagedUrl(function(val){
				assert.equal((val != null),true)
				done()
			})
		});
		it('get vote count on brand new library', function(done) {
			Mix_Controller.getVoteCount(function(val){
				assert.equal((val != null),true)
				done()
			})
		});



		

	});



});

function cleanMusicAndCatalogFolderThenAddMusic(cb){
	let testMusicFolderLocationPath = allAppPaths.findMusicFolderPath()
	rimraf.sync(testMusicFolderLocationPath);
	let testCatalogParentPath = allAppPaths.findAppCatalogsParentPath()
	rimraf.sync(testCatalogParentPath);
	mkdirp(testMusicFolderLocationPath, function(err) { 
		if(err) return cb(err,null)
		moveDummyTracksToTestMusicFolder(function(err){
			if(err) return cb(err,null)
			return cb(null,'done')
		})
	})
}
function moveDummyTracksToTestMusicFolder(cb){
	var arrayOfTestTrackFileNames = [
		'songsA-01.mp3',
		'songsA-02.mp3',
		'songsA-03.mp3',
		'songsA-04.mp3',
		'songsA-05.mp3',
		'songsA-06.mp3',
		'songsA-07.mp3',
		'songsA-08.mp3',
		'songsA-09.mp3',
		'songsA-10.mp3',
		'non_music_file.txt'
	]

	async.each(arrayOfTestTrackFileNames,
		function(item, callback){
			let filePathToCopyFrom = path.join(allAppPaths.findAppPath(),'app','test','DummySoundFilesForTesting/', item)
			let filePathToCopyTo = path.join(allAppPaths.findMusicFolderPath(),item)
			fs.copyFile(filePathToCopyFrom, filePathToCopyTo, (callback))
		},
		cb
	);
}