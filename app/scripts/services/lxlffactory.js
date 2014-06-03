'use strict';

angular.module('lxlfApp')
  .factory('lxlfFactory', ['$firebase', function ($firebase) {
    var ref = new Firebase('https://lxlf.firebaseio.com/lost');
    return $firebase(ref);
  }]);