'use strict';

angular.module('lxlfApp')
  .controller('MapCtrl', ['$scope', 'lxlfFactory',
    function($scope, lxlfService) {

      $scope.markers = [];

      lxlfService.$on('child_added', function(entry){
        var marker = {};
        marker.lat = entry.snapshot.value.lat;
        marker.lng = entry.snapshot.value.lng;
        $scope.markers.push(marker);
      });

      $scope.center = {
        lat: 40.095,
        lng: -3.823,
        zoom: 4
      };

      $scope.zoomTo = function(lat,lng) {
        $scope.center.lat = lat;
        $scope.center.lng = lng;
        $scope.center.zoom = 18;
      };
    }
  ]);