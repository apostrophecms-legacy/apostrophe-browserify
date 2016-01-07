# Apostrophe Browserify

This [Apostrophe 2](http://apostrophenow.org/) module enables you to bundle your frontend code using [`browserify`](https://github.com/substack/node-browserify) while taking advantage of automatic minification and Apostrophe's asset pipeline.

When using the `development` option `watchify` will run, recompiling your assets any time they are saved.

## Installation

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

## Configuration

Apostrophe will save your bundled file to the `public/js/` directory. By default it creates `_site-compiled.js`, however the filename can be configured using the `outputFile` option.

You specify your input files using the `files` option. You may specify more than one. Your input files may use the `require` statement, much as they can in node apps, as described in the [`browserify`](https://github.com/substack/node-browserify) documentation.

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

    // When this is true and `development` is also true
    // your operating system will generate a notification
    // when watchify's build fails. Defaults to `false`.
    notifications: false,

    // When this is true, browserify will run a simple babel
    // transform on your files using the es2015 preset. You // can read about what is included with that here:
    // http://babeljs.io/docs/plugins/preset-es2015/
    es2015: true,

    // When this option is true, you are able to write JSX
    // React within your browserify-compiled files through
    // the reactify transform.
    react: true,

    // When this option is true, you are able to use a small
    // subset of node's fs module: readFileSync, readFile,
    // readdirSync, and readdir.
    // https://github.com/substack/brfs
    brfs: true,

    // Pass additional options into browserify if
    // necessary. Overrides any module-level options.
    browserifyOptions: {

    }
  }
}
```

## For production use

1. Make sure you add `public/js/_site-compiled.js` to your `.gitignore` and `deployment/rsync_exclude.txt` files.

2. When `minify` is true, which it should be for all production Apostrophe sites, the output file will not be recompiled, even on startup, unless it does not exist yet. Together with the `apostrophe:generation` task, this prevents race conditions in a multicore Apostrophe production environment.

## Changelog

`0.5.8`: added native notifications when build fails, improved error logging. Updated styling of console logs to be a little clearer.

`0.5.6`: added source mapping and timestamp logging on recompile when in `development` mode.

`0.5.5`: no need to manually add the output file to your assets. Behaves properly in a multicore environment as long as `minify` is true. Documentation updated. The `basedir` option has been removed, as this module is currently only intended for project-level code, but more thought will be given to how this module could be used in conjunction with module-level code in the future.
