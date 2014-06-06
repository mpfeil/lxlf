'use strict';

angular.module('lxlfApp')
  .controller('MainCtrl', ['$scope', 'lxlfFactory',
    function($scope, lxlfService) {
      
      $scope.found = 0;
      $scope.lost = 0;
      $scope.happy = 0;

      function checkStatus(entry) {
        var category = entry.snapshot.value.category;
        var flagged = entry.snapshot.value.flag;
        if (!flagged) {
          switch(category) {
            case 'lost':
              $scope.lost++;
              break;
            case 'found':
              $scope.found++;
              break;
          }
        } else {
          $scope.happy++;
          switch(category) {
            case 'lost':
              if ($scope.lost !== 0) {$scope.lost--;}
              break;
            case 'found':
              if ($scope.found !== 0) {$scope.found--;}
              break;
          }
        }
      }

      lxlfService.$on('child_added', function(entry){
        checkStatus(entry);
      });

      lxlfService.$on('child_changed', function(entry){
        checkStatus(entry);
      });
    }
  ]);