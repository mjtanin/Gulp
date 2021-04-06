//======================== Import gulp plugin =====================
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const browserSync = require('browser-sync');
const server = browserSync.create();
const clean = require('gulp-clean');
const { watch,series, parallel, task, dest } = require('gulp');
const notify   = require( 'gulp-notify' );

//======================== Image minify =====================
const imagemin = require('gulp-imagemin');


//======================== Sass Compile =====================
task('sass', () => {
    return gulp.src('./assets/sass/**/*.scss')
        .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
                    .pipe(concat('main-style.css'))
                    .pipe(autoprefixer())
                        .pipe(cleanCSS())
                            .pipe(sourcemaps.write())
                                .pipe(dest('./dest/assets/css'))
                                    .pipe(server.stream())
});


//======================== Css Copy =====================
task('copyHtml', () =>{
    return gulp.src('./html/**/*.html')
        .pipe(dest('./dest'))
            .pipe(server.stream())
});


//======================== js Minifi and babel compile =====================
task('js', () => {
    return gulp.src('./assets/js/**/*.js')
        .pipe(sourcemaps.init())
            .pipe(babel())
                .pipe(uglify())
                    .pipe(concat('main-script.js'))
                        .pipe(sourcemaps.write())
                                .pipe(dest('./dest/assets/js'))
                                    .pipe(server.stream())
})


//======================== image compress =====================
var imagesSRC         = './assets/image/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF,svg,SVG}'; // Source folder of images which should be optimized.
var imagesDestination = './dest/assets/image/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

task( 'imgopt', () => {
	gulp.src( imagesSRC )
		.pipe( imagemin({
			progressive: true,
			optimizationLevel: 3, // 0-7 low-high
			interlaced: true,
			svgoPlugins: [{removeViewBox: false}]
		}))
		.pipe( dest( imagesDestination ) )
		.pipe( notify( { message: 'DONE: Images Optimized! 💯', onLast: true } ) );
} );

//======================== Clean Dest file =====================
task('destClean', () => {
    return gulp.src('./dest',{read: false, allowEmpty: true})
        .pipe(clean())
})

//======================== Server Create =====================
task('server', () => {
    browserSync.init({
        server: {
            baseDir: './dest'
        }
    })
});

//======================== Watching =====================
const watchsass = watch('assets/sass/**/*.scss', parallel('sass')).on('change', browserSync.reload)
const watchjs = watch('assets/js/**/*.js', parallel('js')).on('change', browserSync.reload)
const watchimage = watch(imagesSRC, parallel('imgopt')).on('change', browserSync.reload)
const watchhtml = watch('html/**/*.html', parallel('copyHtml')).on('change', browserSync.reload)

task('watch', series('destClean' ,parallel('server','sass', 'copyHtml', 'js', 'imgopt')), () => {
    watchsass;
    watchhtml;
    watchjs;
    watchimage
});

// task('default', series('server', 'watch'));