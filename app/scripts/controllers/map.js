'use strict';

angular.module('lxlfApp')
  .controller('MapCtrl', ['$scope', 'lxlfFactory',
    function($scope, service) {

    $scope.markers = service.getMarkers();

    $scope.addMarker = function(e) {
      if (e.keyCode !== 13 ) {return;}
      service.addMarker({lat: $scope.lat, lng: $scope.lng});
      $scope.lat = '';
      $scope.lng = '';
    };

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