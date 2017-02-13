/**
 * Angular Application
 */
'use strict';

var angular = require('angular');

require('ui-router');
require('ui-bootstrap');

var app = angular.module('app', ['ui.router', 'ui.bootstrap']);

// 加载路由配置信息
app.config(require('./router'));

// 启动任务
app.run(require('./app.run.js'));

/*
 * 控制器注册
 * angular 提供了以下三种注册控制器的方法
 * app.controller(String, Array);
 * app.controller(String, Function);
 * app.controller(Object);  Object = { key = controllerName , value = Array | Function }
 * 为了阅读方便 使用第三种注册方法，保持 require 引用树的对齐。
 */
app.controller(require('./module/main.js'));
app.controller(require('./module/home/dashboard.js'));

// 教务
app.controller(require('./module/edu/class/add.js'));
app.controller(require('./module/edu/class/pending.js'));
app.controller(require('./module/edu/class/open.js'));

app.controller(require('./module/edu/class/list.js'));
app.controller(require('./module/edu/class/detail.js'));
app.controller(require('./module/edu/class/detail-info.js'));
app.controller(require('./module/edu/class/detail-student.js'));
app.controller(require('./module/edu/class/detail-statis.js'));
app.controller(require('./module/edu/class/detail-record.js'));
app.controller(require('./module/edu/class/detail-lesson.js'));
app.controller(require('./module/edu/class/detail-lesson-adjust.js'));
app.controller(require('./module/edu/class/detail-lesson-suspend.js'));
app.controller(require('./module/edu/class/detail-lesson-substitute.js'));

app.controller(require('./module/edu/class/opened.js'));
app.controller(require('./module/edu/class/renew.js'));

app.controller(require('./module/edu/student/list.js'));
app.controller(require('./module/edu/student/detail.js'));
app.controller(require('./module/edu/student/detail-info.js'));
app.controller(require('./module/edu/student/detail-lesson.js'));
app.controller(require('./module/edu/student/detail-record.js'));
app.controller(require('./module/edu/student/detail-course.js'));
app.controller(require('./module/edu/student/detail-attendance.js'));

app.controller(require('./module/edu/class/record.js'));
app.controller(require('./module/edu/notice/list.js'));
app.controller(require('./module/edu/schedule.js'));
app.controller(require('./module/edu/class/search.js'));
app.controller(require('./module/edu/class/archived.js'));

module.exports = app;
