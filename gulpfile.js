const {src, dest, parallel, series, watch} = require('gulp');

const browserSync  = require('browser-sync').create(),
      concat       = require('gulp-concat'),
      uglify       = require('gulp-uglify-es').default,
      sass         = require('gulp-sass')(require('sass')),
      autoprefixer = require('gulp-autoprefixer'),
      imagemin     = require('gulp-imagemin'),
      newer        = require('gulp-newer'),
      del          = require('del');

const bs = () => {
   browserSync.init ({
   server: {baseDir: 'app/'},
   notify: false,
   online: true
   })
}

const styles = () => {
   return src('app/scss/style.scss')
   .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
   .pipe(concat('style.min.css'))
   .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
   .pipe(dest('app/css/'))
   .pipe(browserSync.stream())
}

const scripts = () => {
   return src([
      'app/js/script.js',
   ])
   .pipe(concat('scripts.min.js'))
   .pipe(uglify())
   .pipe(dest('app/js'))
   .pipe(browserSync.stream())
}

const images = () => {
   return src('app/img/src/**/*')
   .pipe(newer('app/img/dest/'))
   .pipe(imagemin())
   .pipe(dest('app/img/dest/'))
}

const cleanimg = () => {
	return del('app/img/dest/**/*', { force: true }) 
}

const buildCopy = () => {
	return src([
      'app/css/**/*.min.css',
      'app/js/**/*.min.js',
      'app/img/dest/**/*',
      'app/**/*.html'
	], {base: 'app'})
   .pipe(dest('dist'))
}
const cleanBuild =() => {
   return del('dist/**/*', { force: true }) 
}

const startWatch = () => {
   watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
   watch(['app/**/*.scss'], styles);
   watch('app/**/*.html').on('change', browserSync.reload);
   watch('app/img/src/**/*', images);
}

exports.bs         = bs;
exports.scripts    = scripts;
exports.styles     = styles;
exports.images     = images;
exports.cleanimg   = cleanimg;
exports.cleanBuild = cleanBuild;
exports.build      = series(cleanBuild, styles, scripts, images, buildCopy);
exports.default    = parallel( scripts, bs, startWatch);

