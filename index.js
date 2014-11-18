var fs = require('fs');
var _ = require('lodash');
var colors = require('colors');
var browserify = require('browserify');
var watchify = require('watchify');

module.exports = aposBrowserify;

function aposBrowserify(options, callback) {
  return new aposBrowserify.AposBrowserify(options, callback);
}

aposBrowserify.AposBrowserify = function(options, callback) {
  var self = this;

  // Add ourselves to the "options.modules" chain
  options.modules = (options.modules || []).concat([ { dir: __dirname, name: 'apostrophe-browserify' } ]);

  // config
  var files = options.files;
  var basedir = options.basedir || (__dirname + '/public/js/');
  var outputFile = './public/js/' + (options.outputFile || '_site-compiled.js');
  options.site.options.assets.scripts.concat(options.outputFile || '_site-compiled.js');

  var browserifyOptions = {
    cache: {},
    packageCache: {},
    fullPaths: false,
    'opts.basedir': basedir
  };
  browserifyOptions = _.merge(browserifyOptions, options.browserifyOptions || {});

  var development = options.development;
  var verbose = (options.verbose !== false);

  self.compileAssets = function(finishCallback) {
    // make a new browserify instance and set the base directory so
    // that require() statements resolve to local files (instead of node modules).
    // if we're in development mode, wrap the browserify instance in
    // watchify so that changes are compiled auto-magically.
    var b = browserify(browserifyOptions);

    if(development) {
      b = watchify(b, { 'opts.basedir': basedir });
    }

    // add the files
    files.forEach( function(file) {
      b.add(file);
    });

    // create the bundled file
    function bundleAssets(cb) {
      b.bundle( function(err, output) {
        if(err) {
          console.error('There was an issue running browserify!');
          console.error(err);
          return finishCallback(err);
        }

        // write our new file to the public/js folder
        fs.writeFile(outputFile, output, function (err) {
          if(err) {
            console.error('There was an error saving the freshly-bundled front end code.');
            console.error(err);
            return finishCallback(err);
          }
          return cb(null);
        });
      });
    }

    // if we're in development mode we want to bind watchify's 'update' event
    if(development) {
      b.on('update', function(ids) {
        if(verbose) {
          process.stdout.write('Detected a change in frontend assets. bundling...   ');
        }
        bundleAssets(function() {
          if(verbose) {
            console.log('Finished bundling.'.green.bold);
          }
        });
      });
      console.log('Watchify is running.'.yellow.bold);
    }

    // run bundle on startup.
    bundleAssets( function() {
      console.log('Ran initial Browserify asset bundling.'.red.green);
      return finishCallback(null);
    });
  };


  self.compileAssets( function() {
    // Invoke callback on next tick if we receive one
    if (callback) {
      process.nextTick(function() { return callback(null); });
    }
  });


};