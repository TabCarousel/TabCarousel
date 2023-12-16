import gulp from 'gulp';
import {deleteSync} from 'del';
import merge from 'gulp-merge-json';
import argv from 'yargs/yargs';
import webpack  from 'webpack-stream';
import webpackconfig from './webpack.config.cjs';

const config = argv.config == undefined ? 'DEV' : argv.config;

function clean(cb) {
   deleteSync(["./dist/"]);
   cb();
}

function copyAllFiles() {
    return gulp
        .src([
            "src/**/*.*",
            "!src/**/*.js",
            "!src/manifest*.json"
        ])
        .pipe(gulp.dest("./dist/"));
}

function transformManifest(cb) {
    return transformJson(cb, "manifest");
}

function transformJson(cb, fileName) {
    if (config == "DEV") {
        return gulp
            .src(`src/${fileName}.json`)
            .pipe(gulp.dest("./dist/"));
    }

    return gulp
        .src([
            `src/${fileName}.json`,
            `src/${fileName}.${config}.json`
        ])
        .pipe(merge({
            fileName: `${fileName}.json`
        }
        ))
        .pipe(gulp.dest('./dist'));
}

function scripts() {
    return gulp
      .src(".")
      .pipe(webpack(webpackconfig))
      .pipe(gulp.dest("dist/javascripts"))
  }

function watch(cb) {

    return gulp.watch(
        [
            "webpack.config.cjs",
            "src/**/*.*",
            '!src/scripts/config.js'
        ],
        gulp.series(clean, scripts, copyAllFiles, transformManifest));

    cb();
}

gulp.task('default', gulp.series(clean, scripts, copyAllFiles, transformManifest));
gulp.task('watch', watch);