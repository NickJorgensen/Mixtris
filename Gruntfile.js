module.exports = function(grunt) {
 
  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-env');
 
  grunt.initConfig({
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
          clearCacheFilter: (key) => true, // Optionally defines which files should keep in cache
          noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
        },
        src: ['test/**/*.js']
      }
    },

    env : {
      options : {
        //Shared Options Hash
      },
      dev : {
        NODE_ENV : 'development'
      },
      test : {
        NODE_ENV : 'test'
      }
    }

  });
 
  grunt.registerTask('default', 'env');
  grunt.registerTask('test', ['env:test', 'mochaTest']);
 
};