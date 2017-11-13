'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('es6', () => {
  gulp.src('src/**/*.js')
    .pipe(babel({
      'ignore': 'gulpfile.babel.js',
      'plugins': ['wildcard'],
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', () => {
  gulp.watch('src/**/*.js', ['es6']);
});

gulp.task('default', [
  'es6',
  'watch'
]);
