
'use strict';

// 扩展原生prototype属性
require('./common/prototype.js');

var $ = require('jquery');
var angular = require('angular');
var app = require('./app.js');
var http = require('./common/http.js');
var browserdetect = require('./common/browserdetect.js');

// 浏览器检测
browserdetect.init();

angular.element(document).ready(function () {
    angular.bootstrap(document, ['app']);
});
