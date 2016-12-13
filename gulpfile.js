'use strict';

// sudo npm i --save-dev gulp-group-css-media-queries autoprefixer-stylus gulp-cssnano gulp-watch gulp-autoprefixer gulp-uglify gulp-stylus gulp-rigger gulp-minify-css gulp-csscomb gulp-imagemin gulp-sourcemaps imagemin-pngquant gulp-plumber gulp-rename vinyl-buffer browser-sync gulp.spritesmith main-bower-files gulp-filter gulp-concat gulp-base64 gulp-svg-sprite

var isProduction = false;

var gulp = require('gulp'),
	watch = require('gulp-watch'),
	autoprefixer = require('autoprefixer-stylus'),
	uglify = require('gulp-uglify'),
	stylus = require('gulp-stylus'),
	rupture = require('rupture'),
	rigger = require('gulp-rigger'),
	base64 = require('gulp-base64'),
	cssmin = require('gulp-minify-css'),
	csscomb = require('gulp-csscomb'),
	cssnano = require('gulp-cssnano'),
	gcmq = require('gulp-group-css-media-queries'),
	imagemin = require('gulp-imagemin'),
	sourcemaps = require('gulp-sourcemaps'),
	pngquant = require('imagemin-pngquant'),
	plumber = require('gulp-plumber'),
	spritesmith = require('gulp.spritesmith'),
	rename = require('gulp-rename'),
	buffer = require('vinyl-buffer'),
	svgSprite = require('gulp-svg-sprite'),
	browserSync = require('browser-sync').create(),
	concat = require('gulp-concat'),
	filter = require('gulp-filter'),
	mainBowerFiles = require('main-bower-files');

var path = {
	build: {
		html: '',
		js: '_include/_js/',
		css: '_include/_css/',
		img: '_include/_img/'
	},
	src: {
		js: '_dev_include/_js/*.js',
		html: '_dev_include/_html/*.html',
		css: '_dev_include/_stylus/main.styl',
		img: '_dev_include/_img/**/*.*',
		sprite: '_dev_include/_icons/png/*.png',
		svgSprite: '_dev_include/_icons/svg/*.svg',
		stylesPartials: '_dev_include/_stylus/_helpers/',
		spriteTemplate: '_dev_include/_icons/stylus.template.mustache',
		svgSpriteTemplate: '_dev_include/_icons/stylusSvg.template.mustache'
	},
	watch: {
		html: '_dev_include/_html/**/*.html',
		js: '_dev_include/_js/main.js',
		css: '_dev_include/_stylus/**/*.styl',
		img: '_dev_include/_img/**/*.*',
		sprite: '_dev_include/_icons/png/*.png',
		svgSprite: '_dev_include/_icons/svg/*.svg'
	}
};

gulp
	.task('js:build', function () {
		gulp.src(path.src.js)
			.pipe(plumber())
			.pipe(rigger())
			.pipe(sourcemaps.init())
			//.pipe(uglify())
			.pipe(rename({
				suffix: '.min'
			}))
			.pipe(sourcemaps.write('./'))
			.pipe(plumber.stop())
			.pipe(gulp.dest(path.build.js))
			.pipe(browserSync.reload({
				stream: true
			}));
	})
	.task('css:build', function () {
		gulp.src(path.src.css)
			.pipe(plumber())
			.pipe(sourcemaps.init())
			.pipe(stylus({
				use: [
					rupture(),
					autoprefixer('last 5 versions')
				],
				'include css': true
			}))
			.pipe(gcmq())
			.pipe(cssnano({zindex: false}))

			.pipe(base64({
			    extensions: ['svg'],
			    maxImageSize: 8*1024,
			    debug: true
			}))
			//.pipe(csscomb())
			//.pipe(cssmin())
			.pipe(rename({
				suffix: '.min'
			}))
			.pipe(sourcemaps.write('./'))
			.pipe(plumber.stop())
			.pipe(gulp.dest(path.build.css))
			.pipe(browserSync.reload({
				 stream: true
			}));
	})
	.task('img:build', function () {
		gulp.src(path.src.img)
			.pipe(plumber())
			.pipe(imagemin({
				progressive: true,
				// svgoPlugins: [{
				//     removeViewBox: false
				// }],
				use: [pngquant()],
				interlaced: true
			}))
			.pipe(plumber.stop())
			.pipe(gulp.dest(path.build.img))
			.pipe(browserSync.reload({
				 stream: true
			}));
	})
	.task('sprite:build', function () {
		var spriteData =
			gulp.src(path.src.sprite)
				.pipe(spritesmith({
					imgName: 'sprite.png',
					cssName: 'sprite.styl',
					cssFormat: 'stylus',
					algorithm: 'binary-tree',
					padding: 0,
					cssTemplate: path.src.spriteTemplate,
					cssVarMap: function (sprite) {
						sprite.name = 'i-' + sprite.name;
					}
				}));

		spriteData.img
			.pipe(buffer())
			.pipe(imagemin())
			.pipe(gulp.dest(path.build.img));

		spriteData.css.pipe(gulp.dest(path.src.stylesPartials));
	})
	.task('svgSprite:build', function () {
		gulp.src(path.src.svgSprite)
			.pipe(svgSprite({
				shape: {
					dimension: {
						maxWidth: 7
					}
				},
				mode: {
					css: {
						dest: './',
						layout: "vertical",
						sprite: path.build.img + 'sprite.svg',
						bust: false,
						render: {
							styl: {
								dest: path.src.stylesPartials + 'svg_sprite.styl',
								template: path.src.svgSpriteTemplate
							}
						}
					}
				}
			}))
			.pipe(imagemin())
			.pipe(gulp.dest('./'));
	})
	.task('html:build', function () {
		gulp.src(path.src.html)
			.pipe(plumber())
			.pipe(rigger())
			.pipe(plumber.stop())
			.pipe(gulp.dest(path.build.html))
			.pipe(browserSync.reload({
				stream: true
			}));
	})
	.task('libs:build', function () {

		var vendors = mainBowerFiles({
			includeDev: true
		});

		gulp.src(vendors)
			.pipe(filter('**/*.js'))
			.pipe(concat('plugins.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest(path.build.js));

		gulp.src(vendors)
			.pipe(filter('**/*.css'))
			.pipe(concat('plugins.min.css'))
			.pipe(cssmin())
			.pipe(gulp.dest(path.build.css))
			.pipe(browserSync.reload({
				stream: true
			}));
	})
	.task('build', [
		'js:build',
		'css:build',
		'img:build',
		'sprite:build',
		'svgSprite:build',
		'html:build',
		'libs:build'
	])
	.task('watch', function () {
		watch([path.watch.img], function (event, cb) {
			gulp.start('img:build');
		});
		watch([path.watch.css], function (event, cb) {
			gulp.start('css:build');
		});
		watch([path.watch.js], function (event, cb) {
			gulp.start('js:build');
		});
		watch([path.watch.sprite], function (event, cb) {
			gulp.start('sprite:build');
		});
		watch([path.watch.svgSprite], function (event, cb) {
			gulp.start('svgSprite:build');
		});
		watch([path.watch.html], function (event, cb) {
			gulp.start('html:build');
		});
		watch('bower.json', function (event, cb) {
			gulp.start('libs:build');
		});

		browserSync.init({
			port: 3000,
			files: ['_dev_include/**/*'],
			injectChanges: true,
			reloadOnRestart: true,
			server: {

				baseDir: "./"
			}
		});
	});
