
var isDevelopment = ( process.env.NODE_ENV !== 'production' );

var config = require('yargs')
  .boolean('optimized')
  .default('optimized', false)
  .argv;

// Load Gulp and friends
var gulp = require('gulp');
var del = require('del');
var path = require('path');
var fm = require('front-matter');
var merge = require('merge');
var runSequence = require('run-sequence');
var browserSync = ( isDevelopment ) ? require('browser-sync').create('puppy-server') : null;
var $ = require('gulp-load-plugins')();
var helpers = require('./helpers');
var vinylMap = require('vinyl-map');



$.util.log('Build Mode: %s', config.optimized ? 'Optimized' : 'Development');

// Individual low-level task definitions go here

/**
 * Compile HTML
 *
 * - Parse data from front-matter headers
 * - Compile Twig templates
 * - Check for useref <!-- build --> blocks to generate production scripts and styles
 * - Minify HTML for optimized builds
 */
gulp.task('puppy-html', ['puppy-styles', 'puppy-scripts'], function(cb) {
  helpers.prepareTwigContext()
    .then(function(context) {
      gulp.src([
        'src/content/**/*.html',
        ])

        // Convert front matter headers to Twig context, accessible
        // in your templates via the `current_page` variable.
        .pipe($.data(function (file) {
          var content = fm(String(file.contents));
          file.contents = new Buffer(content.body);
          var currentPage = {path: '/' + path.relative(file.base, file.path)};
          currentPage = merge(currentPage, content.attributes);
          context['current_page'] = currentPage;
          return context;
        }))

        // Exclude pages with `exclude: true` from build
        .pipe($.filter(function(file) {
          return file.data.current_page.exclude !== true
        }))

        // Compile Twig templates.
        .pipe($.twig({
          base: 'src/templates',
          extend: helpers.addTwigExtensions,
          errorLogToConsole: false
        }))

        // Prevent rendering Frontmatter headers found files not participating in Twig.
        .pipe(vinylMap(function(code, filename) {
          return fm(code.toString()).body;
        }))

        // Concatenate useref tags when running in Optimized mode.
        .pipe($.if(config.optimized, $.useref({searchPath: ['dist']})))

        // Minify Javascript assets extracted by `useref` when the path ends in `.min.js`.
        .pipe($.if(function(file) {
          return ((file.path.indexOf('.js') >= 0) && (file.path.indexOf('.min.js') >= 0));
        }, $.uglify().on('error', $.util.log)))

        // Minify CSS assets extracted by `useref` when the path ends in `.min.css`.
        .pipe($.if(function(file) {
          return ((file.path.indexOf('.css') >= 0) && (file.path.indexOf('.min.css') >= 0));
        }, $.cleanCss({processImport: false})))

        // Minify HTML
        .pipe($.if(config.optimized, $.if('*.html', $.htmlmin({
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        }))))

        // Write to dist
        .pipe(gulp.dest('dist'))

        // Notify of task completion. Required since we're using async code (promises)
        // to populated template context.
        .on('end', cb);
    });
});

/**
 * Compile CSS
 *
 * - write sourcemaps
 * - apply Autoprefixer
 * - inject & refresh via BrowserSync
 */
gulp.task('puppy-styles', ['puppy-modernizr'], function() {
  var p = gulp.src('src/static/scss/**/*.scss')
    .pipe($.sourcemaps.init())

    // Compile Sass
    .pipe(
      $.sass({
        outputStyle: 'nested',
        includePaths: ['src/bower_components']
      })
      .on('error', $.sass.logError)
    )

    // Run CSS through autoprefixer
    .pipe($.autoprefixer('last 10 version'))

    // Minify compiled CSS
    .pipe($.if(config.optimized, $.cleanCss({processImport: false})))

    // Write sourcemaps
    .pipe($.sourcemaps.write('.'))

    // Write development assets
    .pipe(gulp.dest('dist/static/css'));

    if ( isDevelopment ) {
      return p
        // Stream generated files to BrowserSync for injection
        // @see http://www.browsersync.io/docs/gulp/#gulp-sass-css
        .pipe(browserSync.stream());
    }

    return p;
});

/**
 * Pipe static image assets to build directory
 */
gulp.task('puppy-images', function() {
  return gulp.src('src/static/img/**/*')
    .pipe(gulp.dest('dist/static/img'));
});

/**
 * Pipe static font assets to build directory
 */
gulp.task('puppy-fonts', function() {
  return gulp.src('src/static/fonts/**/*')
    .pipe(gulp.dest('dist/static/fonts'));
});


/**
 * Pipe static Javascript assets to build directory
 */
gulp.task('puppy-scripts', ['puppy-modernizr'], function() {
  
  return gulp.src('src/static/js/**/*')
             .pipe(gulp.dest('dist/static/js'))
  
});

/**
 * Custom Modernizr build depending on feature detections used in our source scripts.
 */
gulp.task('puppy-modernizr', function() {
  return gulp.src([
    'src/static/js/**/*.js',
    'src/static/scss/**/*.scss'
    ])
    .pipe($.modernizr({
      options: [
          "setClasses",
          "addTest",
          "html5printshiv",
          "testProp",
          "fnBind"
      ]
    }))
    .pipe($.if(config.optimized, $.uglify()))
    .pipe(gulp.dest("dist/static/js"));
});

/**
 * Pipe static Bower dependencies to build directory
 */
gulp.task('puppy-bower', function() {
  return gulp.src('src/bower_components/**/*')
    .pipe(gulp.dest('dist/bower_components'));
});

/**
 * Clean build directory
 */
gulp.task('puppy-clean', function() {
  return del(['dist']);
});

if ( isDevelopment ) {

  /**
   * Serve build directory locally
   */
  gulp.task('puppy-serve', ['puppy-build'], function() {

    browserSync.init({
      logPrefix: 'Puppy',
      notify: false,
      reloadDelay: 500,
      open: false,
      server: {
        baseDir: "dist"
      }
    });

    // Recompile templates if any HTML, Twig or scripts change
    gulp.watch([
      'src/content/**/*.html',
      'src/templates/**/*.twig',
      'src/static/js/**/*',
      'data/**/*.json',
      'markdown/**/*.md',
      ], ['puppy-html', browserSync.reload]);

    // Trigger styles task when Sass files change. Note that browser reloading
    // is handled directly in the `sass` task with `browserSync.stream()`
    gulp.watch('src/static/scss/**/*.scss', ['puppy-styles']);

    // Move static images and fonts to the `dist` directory and reload when source
    // files change
    gulp.watch('src/static/img/**/*', ['puppy-images', browserSync.reload]);
    gulp.watch('src/static/fonts/**/*', ['puppy-fonts', browserSync.reload]);
  });

}

module.exports = gulp;

// Puppy build process, required before `puppy-serve`

gulp.task('puppy-build', function (cb) {
  return runSequence('puppy-clean', ['puppy-images', 'puppy-fonts', 'puppy-bower'], 'puppy-html', cb);
});
