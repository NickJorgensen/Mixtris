// npm test -UT_GetAppDataPath.js

var assert = require('assert');
var path = require('path');
var allAppPaths = require('../../lib/GetAppDataPath.js')
var APP_ROOT = allAppPaths.findAppPath()


describe('IT for GetAppDataPath.js', function() {

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
      assert.equal(lastCatalogsDirectory, "catalogs_Test");
    });

  	let musicPath = allAppPaths.findMusicFolderPath()
  	let lastMusicPath = path.basename(musicPath)
    it('should contain allMusicFolder as top level folder in path', function() {
      assert.equal(lastMusicPath, "allMusicFolder_Test");
    });

    let catalogFileName = allAppPaths.findAppCatalogsFileName()
    it('should be catalog.json', function() {
      assert.equal(catalogFileName, "catalog_Test.json");
    });

    let catalogFilePath = allAppPaths.findAppCatalogsFilePath()
    let lastInPath = path.basename(catalogFilePath)
    it('should contain catalog file name as top level folder in path', function() {
      assert.equal(lastInPath, "catalog_Test.json");
    });

});