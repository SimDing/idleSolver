let gulp = require('gulp');

let browserify = require('browserify');
let babelify = require('babelify');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');
let uglify = require('gulp-uglify');
let sourcemaps = require('gulp-sourcemaps');
let rename = require('gulp-rename');

gulp.task('copy-resources', () => {
  return gulp.src('./res/**/*')
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', () => {
  // app.js is your main JS file with all your module inclusions
  return browserify({
    'entries': './src/index.js',
    'debug': true
  }).transform('babelify', {
    'presets': ['es2015'],
    'plugins': ['wildcard']
  })
    .bundle()
    .pipe(source('src/app.js'))
    .pipe(rename('bundle.js'))
    .pipe(buffer())
    // .pipe(sourcemaps.init())
    // .pipe(uglify())
    // .pipe(sourcemaps.write('./dist/maps'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('default', [
  'build',
  'copy-resources'
]);
