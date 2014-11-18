# Apostrophe Browserify

This module enables you to use to bundle your frontend code using browserify while still taking advantage of automatic minification and Apostrophe's asset pipeline.

When using the `development` option `watchify` will run, recompiling your assets any time they are saved.

To use it, run `npm install apostrophe-browserify --save` and add it to your `app.js` configuration:

```javascript
{
  ...

  'apostrophe-browserify': {
    // files are specified relative to the project directory (app.js)
    files: [ './public/js/modules/_site.js' ]
  }

  ...
}
```

#### Configuration

Apostrophe will save your bundled file to the `public/js/` directory. By default it creates `_site-compiled.js`, however the filename can be configured using the `outputFile` option.

```javascript
{
  'apostrophe-browserify': {
    // The files to compile. All files in the array are
    // compiled to a single output file.
    files: [ './public/js/modules/_site.js' ],

    // The filename of your bundled file.
    // Defaults to '_site-compiled.js'.
    outputFile: '_site-compiled.js',

    // When this is true `watchify` will recompile your
    // assets any time they are saved. Defaults to `false`.
    development: false,

    // When this is true and `development` is also true
    // watchify will log a message in the console each
    // time your bundle is recompiled. Defaults to `true`.
    verbose: true,

    // The base directory for requiring in local files.
    // This allows you to require other files from the
    // same directory or from relative directories.
    // Defaults to __dirname + '/public/js'.
    basedir: __dirname + '/public/js',

    // Pass additional options into browserify if
    // necessary. Overrides any module-level options.
    browserifyOptions: {

    }
  }
}
```
