var gulp = require('gulp'),
	concat = require('gulp-concat');
	
gulp.task('concat-js', function() {
    gulp.src('public/app/**/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('public/'));
});

gulp.task('concat-css', function() {
    gulp.src('public/app/**/*.css')
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('public/'));
});

gulp.task('watch-app', ['concat-js', 'concat-css'], function() {
	gulp.watch('public/app/**/*.js', ['concat-js'])
	gulp.watch('public/app/**/*.css', ['concat-css'])
});