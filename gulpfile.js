'use strict';

// gulp 基础包 和 gulp常用插件包
var gulp = require('gulp');

var header = require('gulp-header');
var footer = require('gulp-footer');

var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var cleanCss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var concat = require('gulp-concat');
var browserify = require("browserify");

var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var assign = require('lodash.assign');
var es = require('event-stream');

// var gzip = require('gulp-gzip');
// var pngquant = require('imagemin-pngquant');

var handlerError = function () {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: 'compile error',
        message: '<%=error.message %>'
    }).apply(this, args);

    //替换为当前对象
    this.emit(); //提交
};

// 重命名插件，例如 js 压缩时文件名改为 *.min.js 等
var rename = require('gulp-rename');

var del = require('del');

// 浏览器自动刷新依赖
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var path = require('path');

// 读取配置文件
var config = require('./config');


// 目录定义
var basePath = './';
var dist = path.join(basePath, (config.gulp.path || {}).dist || 'dist');
var src = path.join(basePath, (config.gulp.path || {}).src || 'src');

// 文件目录
var filepath = {
    'libs': ['bower_components/**/*'],
    'css': path.join(src, 'css/**/*.css'),
    'js': path.join(src, 'js/bundle/*.js'),
    'less': path.join(src, 'less/**/*.less'),
    'sass': path.join(src, 'sass/**/*.scss'),
    'image': path.join(src, 'image/**/*'),
    'view': [path.join(src, '**/*.html'), '!' + path.join(src, 'libs/**/*.html')]
};

// 编译文件内容
var lessFiles = ['less/style.less', 'less/login.less', 'less/themes/*.theme.less'];

// 编译less
gulp.task('less', ['libs'], function () {

    // 将你的默认的任务代码放在这
    return gulp
        .src(lessFiles.map(function (file) {
            return path.join(src, file);
        }))
        // .pipe(sourcemaps.init())
        .pipe(less())
        .on('error', handlerError)
        // .pipe(sourcemaps.write('./'))  // 输出sourcemap
        .pipe(gulp.dest(path.join(src, 'css')));
});

gulp.task('less-quick', function () {

    // 将你的默认的任务代码放在这
    return gulp
        .src(lessFiles.map(function (file) {
            return path.join(src, file);
        }))
        // .pipe(sourcemaps.init())
        .pipe(less())
        .on('error', handlerError)
        // .pipe(sourcemaps.write('./'))  // 输出sourcemap
        .pipe(gulp.dest(path.join(src, 'css')))
        .pipe(browserSync.stream());
});

// 打包第三方包
gulp.task('libs', function () {
    return gulp.src(filepath.libs)
        .pipe(gulp.dest(path.join(src, 'libs')));
});

var bundler = function (pkg, entry) {

    return pkg.bundle()
        // 如果有错误发生，记录这些错误
        .on('error', handlerError)

        .pipe(source(entry))
        // 可选项，如果你不需要缓存文件内容，就删除
        .pipe(buffer())

        // 可选项，如果你不需要 sourcemaps，就删除
        .pipe(sourcemaps.init({ loadMaps: true })) // 从 browserify 文件载入 map

        // 在这里将变换操作加入管道
        .pipe(sourcemaps.write('./')) // 写入 .map 文件
        .pipe(gulp.dest(path.join(src, 'js/bundle')));
};

var watchifies = [];

// 在这里添加自定义 browserify 选项
// browserify 预编译
gulp.task('browserify', function (done) {

    var files = ['index.js', 'signin.js'];

    var tasks = files.map(function (entry) {

        var opts = assign({}, watchify.args, { entries: [path.join(src, 'js/' + entry)], debug: true });

        var b = browserify(opts); //watchify();

        watchifies.push({
            b: b,
            entry: entry
        });

        return bundler(b, entry);
    });

    return es.merge(tasks);
});


// 服务器监听
gulp.task('dev-server', function () {

    nodemon({
        script: 'app.js',
        ignore: [
            '.vscode',
            '.idea',
            'bower_components/',
            'src/',
            'dist/',
            'private/',
            'gulpfile.js'
        ],
        env: { 'NODE_ENV': 'localhost' }
    });

    browserSync.init(null, {
        proxy: 'http://localhost:' + config.port,
        files: [filepath.css, filepath.js, filepath.view],
        notify: false,
        open: false,
        port: config.gulp.browserSync.port
    });
});

// 编译
gulp.task('build', ['less', 'libs', 'browserify']);

// 监听
gulp.task('watch', function () {
    gulp.watch(filepath.less, ['less-quick']);

    watchifies.forEach(function (option) {
        var w = watchify(option.b);
        w.on('update', bundler.bind(null, w, option.entry));
    });
});
// 开发模式
gulp.task('dev', ['dev-server', 'build', 'watch']);

// 清理缓存
gulp.task('cleanCache', function (cb) {
    return cache.clearAll(cb);
});

// 清空发布目录
gulp.task('clean', ['cleanCache'], function (cb) {
    return del([path.join(dist, '**/*')], cb);
});

// 发布流程:html
gulp.task('release:html', function () {

    var options = {
        //清除HTML注释
        removeComments: true,

        //压缩HTML
        collapseWhitespace: true,

        //删除所有空格作属性值 <input id="" /> ==> <input />
        removeEmptyAttributes: true,

        //压缩页面JS
        minifyJS: true,

        //压缩页面CSS
        minifyCSS: true
    };
    return gulp.src(filepath.view)
        .pipe(htmlmin(options))
        .pipe(gulp.dest(dist));
});

// 发布流程:style
gulp.task('release:style', ['build'], function () {
    return gulp.src(filepath.css)
        .pipe(cleanCss({ keepSpecialComments: 1 }))
        .pipe(gulp.dest(path.join(dist, 'css')));
});

// 发布流程:js
gulp.task('release:javascript', function () {
    return gulp.src(filepath.js)
        .pipe(uglify())
        // .pipe(gzip()) //不需要处理
        .pipe(gulp.dest(path.join(dist, 'js/bundle')));
});

// 发布流程:前端第三方库
gulp.task('release:libs', ['libs'], function () {
    return gulp.src(path.join(src, 'libs/**/*'))
        .pipe(gulp.dest(path.join(dist, 'libs')));
});

// 发布流程:图片处理
gulp.task('release:images', function () {
    return gulp.src(path.join(src, 'images/**/*'))
        // .pipe(cache(imagemin({

        //     //类型：Number  默认：3  取值范围：0-7（优化等级）
        //     optimizationLevel: 5,

        //     //类型：Boolean 默认：false 无损压缩jpg图片 
        //     progressive: true,

        //     //类型：Boolean 默认：false 隔行扫描gif进行渲染 
        //     interlaced: true,

        //     //类型：Boolean 默认：false 多次优化svg直到完全优化 
        //     multipass: true,

        //     svgoPlugins: [{ removeViewBox: false }]

        //     // use: [pngquant()]
        // })))
        .pipe(gulp.dest(path.join(dist, 'images')));
});

// 发布任务list
var releaseTasks = [
    'release:html',
    'release:style',
    'release:javascript',
    'release:libs',
    'release:images',
    'build'
];

// 发布
gulp.task('release', releaseTasks);
