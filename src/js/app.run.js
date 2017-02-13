
'use strict';

var _ = require('underscore');

var message = require('./constants/message.js');

var menu = require('./constants/menu.js');

var notify = require('./common/notify.js');

var eventUtil = require('./common/event-util.js');

var base64 = require('./common/base64.js');

var themes = [
    { text: '经典蓝', name: 'default' },
    { text: '暗蓝色', name: 'flatly' },
    { text: '天空蓝', name: 'cerulean' },
    { text: '橘子橙', name: 'superhero' },
    { text: '深蓝色', name: 'sandstone' },
    { text: '黑色', name: 'cyborg' }
];

module.exports = ['$rootScope', '$state', '$location', function ($root, $state, $location) {

    $root.message = message;

    $root.getMessage = function () {
        return message.get.apply(message, arguments);
    };

    $root.back = function (path) {
        if (path) {
            $location.path(path).replace();
        }
        else {
            history.back();
        }
    };

    eventUtil.addHandler(window, "online", function () {
        notify.success('网络已连接');
    });

    eventUtil.addHandler(window, "offline", function () {
        notify.error('网络已断开');
    });

    $root.$on('$stateChangeStart', function (event, toState, toParams) {
        var redirect = toState.redirectTo;
        if (redirect) {
            event.preventDefault();
            if (angular.isFunction(redirect)) {
                redirect.call($state, toParams);
            }
            else {
                $state.go(redirect, toParams);
            }
        }
    });

    $root.mainMenu = menu;

    $root.shortcutMenu = _.chain($root.mainMenu).pluck('items').flatten().where({ shortcut: true }).value();

    $root.theme = themes[1].name;
}];