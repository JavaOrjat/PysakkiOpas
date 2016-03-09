var PysakkiopasApp = angular.module('PysakkiopasApp', ['ui.router']);

PysakkiopasApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
        
    $stateProvider
        .state('main', {
            url: '/',
            templateUrl: 'app/components/main/main.html',
            controller: 'MainController'
        })
});
