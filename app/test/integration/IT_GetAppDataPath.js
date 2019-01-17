// npm test -UT_GetAppDataPath.js

var assert = require('assert');
var path = require('path');
var allAppPaths = require('../../lib/GetAppDataPath.js')
var APP_ROOT = allAppPaths.findAppPath()


describe('Get app paths', function() {
  	let appPath = allAppPaths.findAppPath()
  	let lastDirectory = path.basename(appPath)
    it('should contain Mixtris as top level folder in path', function() {
      assert.equal(lastDirectory, "Mixtris");
    });

  	let publicAppPath = allAppPaths.findAppPublicDataPath()
  	let lastPublicDirectory = path.basename(publicAppPath)
    it('should contain public as top level folder in path', function() {
      assert.equal(lastPublicDirectory, "public");
    });


  	let appCatalogsPath = allAppPaths.findAppCatalogsPath()
  	let lastCatalogsDirectory = path.basename(appCatalogsPath)
    it('should contain catalogs as top level folder in path', function() {
      assert.equal(lastCatalogsDirectory, "catalogs");
    });

  	let musicPath = allAppPaths.findMusicFolderPath()
  	let lastMusicPath = path.basename(musicPath)
    it('should contain allMusicFolder as top level folder in path', function() {
      assert.equal(lastMusicPath, "allMusicFolder");
    });

    

    


});