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
	util = require('gulp-util'),
	clean = require('gulp-clean'),
	stripDebug = require('gulp-strip-debug'),
	sass = require('gulp-ruby-sass'),					// sass compiler
	autoprefixer = require('gulp-autoprefixer'),			// sets missing browserprefixes
	minifycss = require('gulp-minify-css'),             // minify the css files
	concat = require('gulp-concat'),					// concatinate js
	jshint = require('gulp-jshint'),					// check if js is ok
	stylish = require('jshint-stylish'),                // make errors look good in shell
	uglify = require('gulp-uglify'),					// uglifies the js
	rename = require('gulp-rename'),					// rename files
	browserSync = require('browser-sync'),              // inject code to all devices
	spritesmith = require('gulp.spritesmith'),			// sprite images
	gulpif = require('gulp-if'),						// conditionally control the flow of streams.
	lr = require('tiny-lr'),
	server = lr()
;

/*******************************************************************************
2. FILE DESTINATIONS (RELATIVE TO ASSSETS FOLDER)
*******************************************************************************/
var path = {
	jsDist : 'dist/js',
	cssDist : 'dist/css',
	jsSrc : 'src/js',
	sassSrc : 'src/scss'
};

var target = {
	sassDirSrc : path.sassSrc + '/**/*.scss',				// all sass files
	cssDirDist : 'dist/css',					// where to put minified css
	cssSrcFile: path.sassSrc + '/site.scss',					// css initial project filename
	cssDistFile : pkg.name + '.min.css',			// css output file name
	cssComponentFilesSrc : [
		'src/components/normalize-css/normalize.css',
		'src/components/modernizr.js'		
	],
	cssComponentDirDist : 'dist/components',	
	jsLintFilesSrc : [
		path.jsSrc + '/global.js',
		path.jsSrc + '/togglepaneloffers.js',
		path.jsSrc + '/zipandoffers.js',
		path.jsSrc + '/euc.js',
		path.jsSrc + '/ajax.js'
	],							// all js that should be linted
	jsUglifyFilesSrc : [
		'src/components/jquery/jquery.js',
		'src/components/modernizr/modernizr.js'
	],						// all js files that should not be concatinated
	jsConcactFilesSrc : [],							// all js files that should be concatinated
	jsSrcFileList : [],								// JS files to include
	jsDistFile : pkg.name + '.min.js',				// compiled JS files
	jsDirDist : 'dist/js',					// where to put minified js
	jsComponentFilesSrc : [
		'src/components/modernizr/modernizr.js'		
	],
	jsConcatFileName : pkg.name + 'min.js',
	jsComponentDirDist : 'dist/components', 	// where to put componet js (minified) js
	cleansingAreas : [
		'dist/js/*.js',
		'dist/css/*.css',		
		'dist/components/*'		
	],
	sprites: [
		'A/system/*.png',
		'A/social/*.png'
	]
};

/*******************************************************************************
3. SASS TASK
*******************************************************************************/
gulp.task('sass', function() {
	return gulp.src(target.cssSrcFile)
		.pipe(sass({
			compass: true,
			style: 'expanded',
			lineNumbers: true
		}))
		.pipe(autoprefixer(
            'last 3 versions'
		))
		.pipe(rename(pkg.name + '.css'))
		.pipe(gulp.dest(path.cssDist))
		.pipe(rename(pkg.name + '.min.css'))
		.pipe(sass({
			compass: true,
			style: 'compressed',
			lineNumbers: false
		}))		
		.pipe(gulp.dest(path.cssDist));
});



/*******************************************************************************
4. JS TASKS
*******************************************************************************/
// lint custom js 
gulp.task('js-lint', function() {
    return gulp.src(target.jsLintFilesSrc)                     // get the files
        .pipe(jshint())                                 // lint the files
        .pipe(jshint.reporter(stylish))                 // present the results in a beautiful way
});

// minify all js files that should not be concatinated
gulp.task('js-uglify', function() {
    return gulp.src(target.jsUglifyFilesSrc)                      // get the files
        .pipe(uglify())                                 // uglify the files   	
        .pipe(gulp.dest(target.jsDirDist))                // where to put the files
});

// minify & concatinate all other js
gulp.task('js-concat', function() {
  	return gulp.src(target.jsLintFilesSrc)				// get the files
	  	.pipe(concat(pkg.name + '.js'))  					// concatinate to one file
	  	.pipe(stripDebug())									// strip debug statements
	  	.pipe(gulp.dest(path.jsDist))					// write the file non minified version
	  	.pipe(rename(pkg.name + '.min.js'))					// rename to minified version
		.pipe(uglify())										// uglify the file
	  	.pipe(gulp.dest(path.jsDist));					// write the uglified version
});



/*******************************************************************************
5. SPRITES
*******************************************************************************/
gulp.task('sprites', function () {
	var spriteData;
    spriteData = gulp.src(target.sprites)
    	.pipe(spritesmith({    		
    		imgName : 'sprites.png',
    		cssName : 'sprites.scss',
    		cssFormat: 'scss',
		    cssClass: function (sprite) {
		      sprite.name = 'sprite-' + sprite.name;
    		}	
    	}));
    	spriteData.img.pipe(gulp.dest('B'));
		spriteData.css.pipe(gulp.dest('C'));    
});





/*******************************************************************************
6. BROWSER SYNC
*******************************************************************************/
gulp.task('browser-sync', function() {
    browserSync.init(['dist/css/*.css', 'dist/js/*.js'], {        // files to inject
        proxy: {
            host: 'localhost',                          // development server
            port: '19000'                                // development server port
        }
    });
});


/*******************************************************************************
7. GULP TASKS
*******************************************************************************/
// default task
gulp.task('default', function(){
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




// clean task
gulp.task('cleanse', function(){
	gulp.src(target.cleansingAreas)
		.pipe(clean());
});

// scripts task
gulp.task('scripts', function(){
	gulp.start('js-concat', 'js-uglify');
});

// styles task
gulp.task('styles', function(){
	gulp.start('sass');
});

gulp.task('dev', ['scripts','styles']);




















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