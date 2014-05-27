'use strict';

angular.module('lxlfApp')
  .controller('MainCtrl', ["$scope", "lxlfFactory",
    function($scope, service) {

      $scope.markers = service.getMarkers();
      $scope.addMarker = function(e) {
      	if (e.keyCode != 13 ) return;
        service.addMarker({lat: $scope.lat, lng: $scope.lng});
        $scope.lat = "";
        $scope.lng = "";
      };

      $scope.center = {
      	lat: 40.095,
      	lng: -3.823,
      	zoom: 4
      }
    }
  ]);
