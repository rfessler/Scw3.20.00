'use strict';

/*******************************************************************************
1. DEPENDENCIES
*******************************************************************************/
// Include gulp
var gulp = require('gulp'),		// gulp core

// Include Plugins
	pkg = require('./package.json'),
	bower = require('gulp-bower'),
	bowerFiles = require("gulp-bower-files"),
	plumber = require('gulp-plumber'),                  // disable interuption
	gutil = require('gulp-util'),
	clean = require('gulp-clean'),
	stripDebug = require('gulp-strip-debug'),			
	sass = require('gulp-ruby-sass'),					// sass compiler
	autoprefixer = require('gulp-autoprefixer'),		// sets missing browserprefixes
	minifycss = require('gulp-minify-css'),             // minify the css files
	concat = require('gulp-concat'),					// concatinate js
	jshint = require('gulp-jshint'),					// check if js is ok
	stylish = require('jshint-stylish'),                // make errors look good in shell
	uglify = require('gulp-uglify'),					// uglifies the js
	rename = require('gulp-rename'),					// rename files
	browserSync = require('browser-sync'),              // inject code to all devices
	spritesmith = require('gulp.spritesmith'),			// sprite images
	gulpif = require('gulp-if')						// conditionally control the flow of streams.
;

/**
* Define prod CLI flag
* Run `gulp --prod`
*/
var isprod = gutil.env.prod;

/*******************************************************************************
2a. PATH ASSIGNMENTS (RELATIVE TO ASSSETS FOLDER)
*******************************************************************************/
// Define the Source paths
var SrcPath = {
	JS: 	 'src/js/',
	SASS: 	 'src/scss/',
	Vendors: 'src/vendors/',
	Images:  'images/sprites/'	
};

// Define the Distination/Target paths
var DistPath = {
	JS: 	 'dist/js/',
	CSS: 	 'dist/css/',
	Vendors: 'dist/vendors/',
	SpritesCSS:  'src/scss/sprites/',
	SpritesIMG: 	'dist/sprites/'
};


/*******************************************************************************
2b. FILE ASSIGNMENTS (RELATIVE TO ASSSETS FOLDER)
*******************************************************************************/
// assign the files
var Src = {	
	sass: SrcPath.SASS + 'site.scss',  		// the site.scss main file
	js: 	 SrcPath.JS + '**/*.js'				// all js files
};

var Dist = {
	css: pkg.name + '.css',						// dist/css/pkgname.css	
	js: pkg.name + '.js',



	cleanup: [									// the dist folders to clean before distribution
		DistPath.CSS + '*',
		DistPath.JS + '*',
		DistPath.SpriteIMG + '*',
		DistPath.SpritesCSS + '_sprites.scss'
	]
};

var AllFiles = {
	SASS: SrcPath.SASS + '**/*.scss',
	CSS: DistPath.CSS + '*.css',
	JS: SrcPath.JS +  '**/*.js',
	Images: SrcPath.Images + '**/*.png'
};

/*******************************************************************************
3. SASS TASK
*******************************************************************************/
gulp.task('sass', function(){
	return gulp.src(Src.sass)				// get source files
		.pipe(plumber())
		.pipe(sass({							// run sass
			compass: true,						// Opt: use compass
			style: 'expanded',					// Opt: compass compile expanded
			lineNumbers: true					// Opt: display line nos in file
		}))
		.pipe(autoprefixer(						// run autoprefixer
            'last 3 versions',					// Opt: prefix to last 3 versions
            'safari 5',
            'ie 8',
            'ie 9',
            'opera 12.1',
            'ios 6',
            'android 4'
		))	
		.pipe(rename(Dist.css))					// rename non-minified file
		.pipe(gulp.dest(DistPath.CSS))			// output path
		.pipe(gulpif(isprod, minifycss()))		// if isprod then minifycss
		.pipe(rename({suffix: '.min'}))			// rename to minified file
		.pipe(gulp.dest(DistPath.CSS));			// output minified file
});  // ends sass task


/*******************************************************************************
4. JS TASKS
*******************************************************************************/
// lint custom js 
gulp.task('js-lint', function() {
    return gulp.src(Src.js)              		// get the files
        .pipe(jshint('.jshintrc'))              // lint the files
        .pipe(jshint.reporter(stylish))         // present the results in a beautiful way
});

// minify all js files that should not be concatinated
gulp.task('js-uglify', function() {
    return gulp.src()              				// get the files
     	.pipe(gulpif(isprod, uglify())) 		// If we use the `--dev` flag, uglify will not take place, else uglify the files
        .pipe(gulp.dest(Dist.JS))              	// where to put the files
});


// minify & concatinate all other js
gulp.task('js-concat', function() {
  	return gulp.src(Src.js)						// get the files
	  	.pipe(concat(Dist.js))  				// concatinate to one file
	  	.pipe(stripDebug())						// strip debug statements
	  	.pipe(gulp.dest(DistPath.JS))			// write the file non minified version
	  	.pipe(rename({suffix: '.min'}))			// rename to minified version
     	.pipe(gulpif(isprod, uglify())) 		// If we use the `--dev` flag, uglify will not take place, else uglify the files
	  	.pipe(gulp.dest(DistPath.JS));			// write the uglified version
});



/*******************************************************************************
5. CLEAN-UP DESTINATIONS TASK
*******************************************************************************/
gulp.task('cleanup', function(){
	gulp.src(Dist.cleanup, {read: false})
		.pipe(clean());
});



/*******************************************************************************
6. SPRITES
*******************************************************************************/
gulp.task('sprites', function () {
	var spriteData;
    spriteData = gulp.src(AllFiles.Images)
    	.pipe(spritesmith({    		
    		imgName : 'sprites.png',
    		cssName : '_sprites.scss',
    		cssFormat: 'scss',
		    cssClass: function (sprite) {
		      sprite.name = 'sprite-' + sprite.name;
    		}	
    	}));
    	spriteData.img.pipe(gulp.dest(DistPath.SpritesIMG));
		spriteData.css.pipe(gulp.dest(DistPath.SpritesCSS));    
});


/*******************************************************************************
7. BROWSER SYNC
*******************************************************************************/
gulp.task('browser-sync', function() {
    browserSync.init(['dist/css/*.css', 'dist/js/*.js'], {	// files to inject
        proxy: {
            host: 'localhost',                          	// development server
            port: '19000'                                	// development server port
        }
    });
});


/*******************************************************************************
8. GULP TASKS
*******************************************************************************/
// default task
gulp.task('default', ['cleanup'], function(){
	gulp.start('sass', 'js-lint', 'js-uglify', 'js-concat', 'browser-sync');
	gulp.watch('scss/**/*.scss', function() {
	    gulp.start('sass');
	});
	gulp.watch(target.js_lint_src, function() {
	    gulp.start('js-lint');
	});
	gulp.watch(target.js_minify_src, function() {
	    gulp.start('js-uglify');
	});
	gulp.watch(target.js_concat_src, function() {
	    gulp.start('js-concat');
	});	
});

// Watch Task
gulp.task('watch', ['browser-sync'], function(){
	// watch .scss files
	gulp.watch(AllFiles.SASS, ['styles']);

	// watch .js files
	gulp.watch(AllFiles.JS, ['scripts']); 

	// watch image files
	gulp.watch(AllFiles.Images, ['images']); 
});





// scripts task
gulp.task('scripts', function(){
	gulp.start('js-concat', 'js-uglify');
});

// styles task
gulp.task('styles', ['cleanup', 'sass']);


gulp.task('development', ['scripts','styles']);




















/* EXAMPLE CODE SNIPPETS ****************************************************************

gulp.task('sp-Exp1', function () {
	var spriteData;

    spriteData = gulp.src('A/social/*.png')
    	.pipe(spritesmith({    		
    		imgName : 'social.png',
    		cssName : 'social.scss',
    		cssFormat: 'scss',
		    cssClass: function (sprite) {
		      sprite.name = 'sprite-' + sprite.name;
    		}	
    	}));
    	spriteData.img.pipe(gulp.dest('B'));
		spriteData.css.pipe(gulp.dest('C'));
    
    spriteData = gulp.src('A/system/*.png')
    	.pipe(spritesmith({    		
    		imgName : 'system.png',
    		cssName : 'system.scss',
    		cssFormat: 'scss',
		    cssClass: function (sprite) {
		      sprite.name = 'sprite-' + sprite.name;
    		}	
    	}));
    	spriteData.img.pipe(gulp.dest('B'));
		spriteData.css.pipe(gulp.dest('C'));
});

gulp.task('sa', function() {
	return gulp.src(['src/assets/scss/screen.scss'])
		.pipe(plumber())
		.pipe(sass({
			style: 'expanded',
			lineNumbers: true,
			compass: true
		}))
		.pipe(autoprefixer(
            'last 3 version'
		))
		.pipe(rename(pkg.name + '.css'))
		.pipe(gulp.dest(path.cssDist))
		.pipe(rename(pkg.name + '.min.css'))
		.pipe(sass({
			style: 'compressed',
			lineNumbers: false,
			compass: true
		}))		
		.pipe(gulp.dest(path.cssDist));
});

********************************************************************************************/