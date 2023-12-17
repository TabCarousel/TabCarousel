import gulp from 'gulp';
import { deleteSync } from 'del';
import argv from 'yargs/yargs';
import webpack from 'webpack-stream';
import webpackconfigdev from './webpack.dev.cjs';
import webpackconfigprod from './webpack.prod.cjs';
import zip from 'gulp-zip';

const distFileName = 'TabCarousel.zip';

function clean(cb) {
    deleteSync(['./dist/']);
    cb();
}

function copyAllFiles() {
    return gulp
        .src([
            'src/**/*.*',
            '!src/**/*.js',
        ])
        .pipe(gulp.dest('./dist/'));
}

function scripts() {
    const isProduction = (argv.production === undefined) ? false : true;
    let webpackconfig;
    if (isProduction) {
        webpackconfig = webpackconfigprod;
    }
    else {
        webpackconfig = webpackconfigdev;
    }
    return gulp
        .src('.')
        .pipe(webpack(webpackconfig))
        .pipe(gulp.dest('dist'));
}

function watch() {
    return gulp.watch(
        [
            '*.cjs',
            'src/**/*.*',
            '!*.zip',
            '!src/scripts/config.js'
        ],
        gulp.series(clean, scripts, copyAllFiles));
}

function prepareZip() {
    return gulp.src(['dist/**/*.*'])
        .pipe(zip(distFileName))
        .pipe(gulp.dest('.'));
}

gulp.task('default', gulp.series(clean, scripts, copyAllFiles, prepareZip));
gulp.task('watch', watch);