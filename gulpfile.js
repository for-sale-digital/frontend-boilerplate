const gulp = require('gulp');
const buffer = require('vinyl-buffer');
const concat = require('gulp-concat');
const date2string = require('date2string');
const glob = require('glob');
const header = require('gulp-header');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const { argv } = require('yargs');

const sass = require('gulp-sass')(require('sass'));
const stylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');

const eslint = require('gulp-eslint');
const cache = require('gulp-cached');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');

const config = require('./gulpconfig');
const pkg = require('./package.json');

let haltOnError = true;

// Toggle production mode via flag '--production' to prevent linters from being executed:
const prodMode = !!argv.production;

const sassFiles = `${config.build.sources.sass}**/*.s+(a|c)ss`;
const jsFiles = `${config.build.sources.js}**/*.js`;

const handleError = (error) => {
    // eslint-disable-next-line no-console
    console.log(error.toString());
    if (haltOnError) {
        throw error;
    }
};

const lintSass = (done) => {
    if (!prodMode) {
        gulp.src(sassFiles)
            .pipe(
                stylelint({
                    reporters: [{ formatter: 'verbose', console: true }],
                }),
            )
            .on('error', handleError);
    }
    done();
};

const compileSass = (done) => {
    gulp.src(`${config.build.sources.sass}*.s+(a|c)ss`)
        .pipe(sourcemaps.init())
        .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(postcss([postcssPresetEnv()]))
        .pipe(
            rename({
                suffix: '.min',
            }),
        )
        .pipe(
            header(config.build.banner, {
                pkg,
                timestamp: date2string(new Date(), 'Y-m-d H:i:s'),
            }),
        )
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.build.targets.css));
    done();
};

const watchCompileSass = (done) => {
    gulp.watch(sassFiles, gulp.parallel(['compile-sass']));
    done();
};

const lintJs = (done) => {
    if (!prodMode) {
        gulp.src([jsFiles, './gulpfile.js'])
            .pipe(cache('lint-js'))
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError())
            .on('error', handleError);
    }
    done();
};

const compileJs = (done) => {
    const b = browserify({
        entries: glob.sync(jsFiles),
        debug: true,
        transform: [
            babelify.configure({
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            useBuiltIns: 'usage',
                            corejs: 3,
                        },
                    ],
                ],
            }),
        ],
    });

    b.bundle()
        .pipe(source(jsFiles))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(concat(`${config.build.basename}.js`, { newLine: ';' }))
        .pipe(uglify())
        .pipe(
            rename({
                suffix: '.min',
            }),
        )
        .pipe(
            header(config.build.banner, {
                pkg,
                timestamp: date2string(new Date(), 'Y-m-d H:i:s'),
            }),
        )
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.build.targets.js));
    done();
};

const watchCompileJs = (done) => {
    gulp.watch(jsFiles, gulp.parallel(['compile-js']));
    done();
};

const watch = (done) => {
    haltOnError = false;
    gulp.watch([jsFiles, sassFiles], gulp.parallel(['default']));
    done();
};

const copyLibsCss = (done) => {
    if (config.static.sources.css && config.static.sources.css.length) {
        gulp.src(config.static.sources.css, { allowEmpty: true }).pipe(gulp.dest(config.static.targets.css));
    }
    done();
};

const copyLibsJs = (done) => {
    if (config.static.sources.js && config.static.sources.js.length) {
        gulp.src(config.static.sources.js, { allowEmpty: true }).pipe(gulp.dest(config.static.targets.js));
    }
    done();
};

gulp.task('lint-sass', lintSass);
gulp.task('compile-sass', gulp.series('lint-sass', compileSass));
gulp.task('compile-sass:watch', watchCompileSass);
gulp.task('lint-js', lintJs);
gulp.task('compile-js', gulp.series('lint-js', compileJs));
gulp.task('compile-js:watch', watchCompileJs);
gulp.task('copy-libs', gulp.parallel(copyLibsCss, copyLibsJs));
gulp.task('default', gulp.series('compile-sass', 'compile-js'));
gulp.task('watch', watch);
gulp.task('default:watch', gulp.series('default', 'watch'));
