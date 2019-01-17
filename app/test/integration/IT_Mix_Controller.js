
var assert = require('assert');
var path = require('path');


var allAppPaths = require('../../lib/GetAppDataPath.js')
var APP_ROOT = allAppPaths.findAppPath()
var Mix_Controller = require(path.join(APP_ROOT,'lib','Mix_Controller.js'))


describe('Array', function() {


  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });



});