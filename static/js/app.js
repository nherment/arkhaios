var imageManagement = angular.module('imageManagement', [])
    .config(function($routeProvider) {
        $routeProvider.when('/index', {
            redirectTo: '/index/1'
        })
        .when('/index/:page', {
            templateUrl: 'js/partials/imageInfoList.html',
            controller: 'ListCtrl'
        })
        .when('/upload', {
            templateUrl: 'js/partials/imageUpload.html'
        })
        .when('/acl', {
            templateUrl: 'js/partials/AccessControls.html',
            controller: 'AccessControlCtrl'
        })
        .when('/login', {
            templateUrl: 'js/partials/login.html',
            controller: 'LoginCtrl'
        })
        .when('/info/:id', {
            templateUrl: 'js/partials/info.html',
            controller: 'InfoCtrl'
        })
        .when('/add', {
            templateUrl: 'js/partials/add.html',
            controller: 'AddCtrl'
        })
        .when('/edit/:id', {
            templateUrl: 'js/partials/edit.html',
            controller: 'EditCtrl'
        })
        .when('/remove/:id', {
            templateUrl: 'js/partials/remove.html',
            controller: 'RemoveCtrl'
        })
        .otherwise({
            redirectTo: '/index'
        });
    });

