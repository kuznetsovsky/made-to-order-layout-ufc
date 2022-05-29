const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sourcemaps = require('gulp-sourcemaps');
const del = require("del");
const bs = require('browser-sync').create();
const minify = require('gulp-csso');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const gcmq = require('gulp-group-css-media-queries');

const path = {
  src: {
      html: "./src/*.html",
      style: "./src/main.scss",
      js: "./src/js/*.js",
      img: {
          copy: "./src/static/img/**/*.{png,jpg,svg,webp}",
          opti: "./src/static/img/**/*.{png,jpg,svg}",
          webp: "./src/static/img/**/*.{png,jpg}"
      },
      fonts: './src/static/fonts/**/*.{woff,woff2}',
      libs: "./src/libs/**/*.*"
  },
  public: {
      html: "public/",
      style: "public/css/",
      js: "public/js",
      img: {
          public: "public/img",
          copy: "./src/static/img/"
      },
      fonts: "public/fonts/",
      libs: "public/libs/"
  },
  watch: {
    html: "./src/*.html",
    scss: "./src/**/*.scss",
    js: "./src/js/**/*.js"
  },
  clean: 'public',
};

function html() {
  return src(path.src.html)
    .pipe(dest(path.public.html))
    .pipe(bs.stream());
}

function css() {
  return src(path.src.style)
    .pipe(sourcemaps.init())
    // .pipe(gcmq())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      })
    ]))
    .pipe(rename("style.css"))
    .pipe(sourcemaps.write())
    .pipe(dest(path.public.style))
    .pipe(bs.stream());
}

function cssPublic() {
  return src(path.src.style)
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      })
    ]))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(dest(path.public.style));
}

function javaScript() {
  return src(path.src.js)
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write())
    .pipe(dest(path.public.js));
}

function jsPublic() {
  return src(path.src.js)
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(rename("scripts.min.js"))
    .pipe(dest(path.public.js));
}

function clean() {
  return del(path.clean);
}

function serve() {
  bs.init({
    server: path.public.html
  });

  watch(path.watch.js, javaScript);
  watch(path.watch.scss, css);
  watch(path.watch.html, html).on('change', bs.reload);
}

function imgCopy() {
  return src(path.src.img.copy)
    .pipe(rename({ dirname: '' }))
    .pipe(dest(path.public.img.public));
}

function fontsCopy() {
  return src(path.src.fonts)
    .pipe(dest(path.public.fonts));
}

// Windows 7 is not actively maintained.
function imgWebp() {
  return src(path.src.img.webp)
    .pipe(webp())
    .pipe(rename({ dirname: '' }))
    .pipe(dest(path.public.img.copy));
}

function imgOptimization() {
  return src(path.src.img.opti)
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.svgo()
    ]))
    .pipe(rename({ dirname: '' }))
    .pipe(dest(path.public.img.copy));
}

function libs() {
  return src(path.src.libs)
  .pipe(dest(path.public.libs))
}

exports.html = html;
exports.css = css;
exports.cssPublic = cssPublic;
exports.clean = clean;
exports.serve = serve;
exports.imgCopy = imgCopy;
exports.imgWebp = imgWebp;
exports.jsPublic = jsPublic;
exports.imgOptimization = imgOptimization;
exports.libs = libs;
exports.default = series(clean, parallel(html, css, imgCopy, fontsCopy, javaScript, serve));
exports.public = series(clean, parallel(html, cssPublic, imgCopy, fontsCopy, jsPublic, serve));
