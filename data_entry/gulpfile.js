var gulp = require('gulp');

var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');


gulp.task('sass', function() {
    return gulp.src('src/**/*.scss')
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('typescript', function() {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/ts/script.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.scss', gulp.series('sass'));
    gulp.watch('src/**/*.ts', gulp.series('typescript'));
});


gulp.task('default', gulp.series('sass', 'typescript', 'watch'));