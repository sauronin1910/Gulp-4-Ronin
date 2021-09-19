const { src, dest, parallel, series, watch } = require("gulp");

const browserSync = require("browser-sync").create(),
  sass = require("gulp-sass")(require("sass")),
  concat = require("gulp-concat"),
  autoprefixer = require("gulp-autoprefixer"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin"),
  changed = require("gulp-changed"),
  del = require("del");

const server = () => {
  browserSync.init({
    server: { baseDir: "app/" },
    notify: false,
    online: true,
  });
};

const styles = () => {
  return src("app/scss/**/style.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({ overrideBrowserslist: ["last 10 versions"], grid: true })
    )
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src("app/js/src/script.js")
    .pipe(concat("script.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js/dest"))
    .pipe(browserSync.stream());
};

const images = () => {
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
  watch(["app/**/*.js", "!app/**/*.min.js"], scripts);
  watch("app/**/*.scss", styles);
  watch("app/**/*.html").on("change", browserSync.reload);
  watch("app/img/src/**/*", images);
};

exports.server = server;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.distBuild = distBuild;
exports.cleanImg = cleanImg;
exports.cleanBuild = cleanBuild;
exports.build = series(cleanBuild, styles, scripts, images, distBuild);
exports.default = parallel(server, styles, scripts, watcher);
