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

  self.apos = options.apos;

  // config
  var files = options.files;
  var outputName = (options.outputFile || '_site-compiled.js');
  var basedir = self.apos.options.rootDir + '/public/js/';
  var outputFile = basedir + outputName;

  // Borrowed from apostrophe-site. We want to push paths
  // relative to the site. -Tom
  function pushAsset(type, name, _options) {
    var options = {
      fs: self.apos.options.rootDir,
      web: '',
      when: 'always'
    };
    _.extend(options, _options);
    return self.apos.pushAsset(type, name, options);
  }

  // This event doesn't fire until our file actually exists, which
  // is handy because pushAsset will quitely not push it if it doesn't. -Tom

  self.apos.on('beforeEndAssets', function() {
    // Allow it to work if they specified .js explicitly. The
    // apostrophe-browserify docs suggest that, but apostrophe's
    // pushAsset assumes you didn't include it. -Tom
    pushAsset('script', outputName.replace(/\.js$/, ''), {});
  });

  if (self.apos.options.minify && fs.existsSync(outputFile)) {
    if (verbose) {
      console.error('exists - skipping');
    }
    return finish();
  }

  var development = options.development;
  var verbose = (options.verbose !== false);

  var browserifyOptions = {
    cache: {},
    packageCache: {},
    fullPaths: false,
    'opts.basedir': basedir,
    debug: development
  };
  browserifyOptions = _.merge(browserifyOptions, options.browserifyOptions || {});



  self.compileAssets = function(finishCallback) {
    // make a new browserify instance and set the base directory so
    // that require() statements resolve to local files (instead of node modules).
    // if we're in development mode, wrap the browserify instance in
    // watchify so that changes are compiled auto-magically.
    var b = browserify(browserifyOptions);

    if(development) {
      // enable source maps in watchify mode
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
          process.stdout.write('Detected a change in frontend assets. Bundling... ');
        }
        bundleAssets(function() {
          if(verbose) {
            console.error('Finished bundling.'.green.bold + ' ' + Date().gray);
          }
        });
      });
      if (verbose) {
        console.error('Watchify is running.'.yellow.bold);
      }
    }

    // run bundle on startup.
    bundleAssets( function() {
      if (verbose) {
        console.error('Ran initial Browserify asset bundling.'.green.bold);
      }
      return finishCallback(null);
    });
  };


  self.compileAssets(finish);

  function finish() {
    // Invoke callback on next tick if we receive one
    if (callback) {
      process.nextTick(function() { return callback(null); });
    }
  }
};
