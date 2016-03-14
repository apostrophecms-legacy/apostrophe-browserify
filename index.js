var fs         = require('fs');
var _          = require('lodash');
var path       = require('path');
var colors     = require('colors');
var browserify = require('browserify');
var watchify   = require('watchify');
var babelify   = require('babelify');
var reactify   = require('reactify');
var notifier   = require('node-notifier');

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
    notice('exists - skipping');
    return finish();
  }

  var development = options.development;
  var verbose = (options.verbose !== false);
  if (self.apos.isTask()) {
    // Default behavior should not be to mess up the output of tasks
    verbose = options.verbose;
  } else {
    // In normal startup default behavior is to be noisy (in this module)
    verbose = (options.verbose !== false);
  }
  var es2015 = options.es2015;
  var react = options.react;
  var brfs = options.brfs
  var notifications = options.notifications;

  var browserifyOptions = {
    cache: {},
    packageCache: {},
    'opts.basedir': basedir,

    // if we are in development mode we want fullPaths to enable sourceMaps
    fullPaths: development,
    // enable sourceMaps in development
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

    if(es2015){
      // if called for, compile es2015 with babel
      b.transform(babelify, { presets: ['es2015'] });
    }

    if(react){
      //if called for, compile JSX through reactify
      b.transform(reactify);
    }

    if(brfs){
      b.transform('brfs');
    }

    // create the bundled file
    function bundleAssets(cb) {
      b.bundle( function(err, output) {
        if(err) {
          console.error('There was an issue running browserify! No new output file was created.'.red.bold);
          console.error('Error: '.red + err.message);

          // crash the server, but only in production mode.
          if(!development) {
            return callback(err);
          }

          if(development && notifications) {
            notifier.notify({
              title: 'Browserify Build Failed',
              message: err.message
            });
          }

          return cb(err);
        }

        // write our new file to the public/js folder
        fs.writeFile(outputFile, output, function (err) {
          if(err) {
            console.error('There was an error while writing the freshly-bundled front end code in apostrophe-browserify.');
            console.error(err.message);
          }
          return cb(err);
        });
      });
    }

    // if we're in development mode we want to bind watchify's 'update' event
    if(development) {
      b.on('update', function(ids) {
        if(verbose) {
          process.stdout.write('Detected a change in frontend assets. Bundling... ');
        }
        return bundleAssets(function(err) {
          if (!err) {
            notice('Finished bundling.'.green.bold + ' ' + Date().gray);
          }
          console.error('\n* * * HEY * * *');
          console.error('Your site will FAIL IN PRODUCTION if you don\'t fix this!\n');
        });
      });
      notice('Watchify is running.'.yellow.bold);
    }

    // run bundle on startup.
    return bundleAssets( function(err) {
      if (!err) {
        notice('Ran initial Browserify asset bundling.'.green.bold);
      }
      // Stop the show on error! The site is not usable without a successful build. -Tom and Austin
      return finishCallback(err);
    });
  };


  self.compileAssets(finish);

  function finish(err) {
    // Invoke callback on next tick if we receive one
    if (callback) {
      process.nextTick(function() { return callback(err); });
    }
  }

  function notice(s) {
    if (!verbose) {
      return;
    }
    console.error('apostrophe-browserify: ' + s);
  }
};
