var gulp = require('gulp'),
	nodemon = require('gulp-nodemon');

gulp.task('nodemon', ['watch-app'], function() {
	// yritä saada livereload, toimii :D yritin mut en osannu (tai jaksanu)
	 // livereload.listen();
	nodemon({
		script: 'index.js',
		ext: 'js html css',
		ignore: ['public/app/**/*.js', 'public/app/**/*.css', 'gulp', 'test']
	}).on('restart', function(){
		console.log('server restart');
		 // livereload.reload();
	})
})