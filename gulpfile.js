const { src, dest, parallel, series, watch } = require("gulp");

const browserSync   = require("browser-sync").create(),
      plumber       = require("gulp-plumber"),
      sass          = require("gulp-sass")(require("sass")),
      concat        = require("gulp-concat"),
      autoprefixer  = require("gulp-autoprefixer"),
      uglify        = require("gulp-uglify-es").default,
      sourcemaps    = require('gulp-sourcemaps'),
      imagemin      = require("gulp-imagemin"),
      image         = require('gulp-image'),
      changed       = require("gulp-changed"),
      del           = require("del");

const server = () => {
  browserSync.init({
    server: { baseDir: "app/" },
    notify: false,
    online: true,
  });
};

const styles = () => {
  return src("app/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({ overrideBrowserslist: ["last 10 versions"], grid: true })
    )
    .pipe(sourcemaps.write('../css'))
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src("app/js/src/**/*.js")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat("script.min.js"))
    .pipe(uglify())
    .pipe(sourcemaps.write('../css'))
    .pipe(dest("app/js/dest"))
    .pipe(browserSync.stream());
};

const img = () => {
  return src("app/img/src/**/*")
    .pipe(changed("app/img/dest"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(image({
      svgo: false
    }))
    .pipe(dest("app/img/dest"));
};

const cleanImg = () => {
  return del("app/img/dest/**/*", { force: true });
};

const distBuild = () => {
  return src(
    [
      "app/css/**/*.min.css",
      "app/js/**/*.min.js",
      "app/img/dest/**/*",
      "app/**/*.html",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
};

const cleanBuild = () => {
  return del("dist/**/*", { force: true });
};

const watcher = () => {
  watch(["app/js/**/*.js", "!app/**/*.min.js"], scripts);
  watch("app/**/*.scss", styles);
  watch("app/**/*.html").on("change", browserSync.reload);
  watch("app/img/src/**/*", img);
};

exports.server      = server;
exports.scripts     = scripts;
exports.styles      = styles;
exports.img         = img;
exports.distBuild   = distBuild;
exports.cleanImg    = cleanImg;
exports.cleanBuild  = cleanBuild;
exports.build       = series(cleanBuild, styles, scripts, img, distBuild);
exports.default     = parallel(server, styles, scripts, watcher);
