/**
 * angular-router 状态注册
 */
'use strict';

module.exports = ['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouter) {

    $stateProvider.state('dashboard', {
        title: '欢迎页',
        url: '^/',
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardController'
    });

    // 教务模块
    require('./edu.js').apply(this, arguments);

    $urlRouter.otherwise('/');
}];