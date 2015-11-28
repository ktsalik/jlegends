"use strict";

var routes = angular.module('routes', ['ui.router', 'ui.router.css']);

routes.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('dashboard', {
      url: '/',
      templateUrl: '/views/dashboard.html',
      controller: 'dashboardController',
      css: ['/views/dashboard.css']
    })
    .state('game', {
      url: '/game/:character',
      templateUrl: '/views/game.html',
      css: ['/views/game.css'],
      controller: 'gameController'
    })
    .state('games', {
      url: '/games',
      templateUrl: '/views/games.html',
      css: ['/views/games.css'],
      controller: 'gamesController'
    })
    .state('multiplayer', {
      url: '/game/:game/:character',
      templateUrl: '/views/game.html',
      css: ['/views/game.css'],
      controller: 'multiplayerController'
    })
  $urlRouterProvider.otherwise('/');
});