'use strict';

angular.module('lxlfApp')
  .controller('MapCtrl', ["$scope", "lxlfFactory", "leafletData",
    function($scope, service, leafletData) {

      $scope.markers = service.getMarkers();
      $scope.pagedMarkers = $scope.markers;

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

      $scope.zoomTo = function(lat,lng) {
        $scope.center.lat = lat;
        $scope.center.lng = lng;
        $scope.center.zoom = 18;
      }

      $scope.addLostFound = function() {

      }

      $scope.totalItems = $scope.markers.length;
      $scope.currentPage = 1;

      $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
      };

      $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);
      };
    }
  ]);
