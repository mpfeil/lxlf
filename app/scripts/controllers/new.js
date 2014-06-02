'use strict';

angular.module('lxlfApp')
  .controller('NewCtrl', ["$scope", "$location", "lxlfFactory",
    function($scope, $location, service) {

      $scope.center = {
        lat: 52,
        lng: 7,
        zoom: 10
      };

      $scope.markers = {
        box: {
            lat: 52,
            lng: 7,
            focus: true,
            draggable: true
        }
      };

      $scope.defaults = {
        tileLayer: "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          tileLayerOptions: {
            opacity: 0.9,
              detectRetina: true,
              reuseTiles: true,
          },
          scrollWheelZoom: false
      };

      $scope.submitted = false;

      // function to submit the form after all validation has occurred      
      $scope.submitForm = function(isValid) {

        $scope.submitted = true;

        // check to make sure the form is completely valid
        if (isValid) {
          service.addMarker({
            lat: $scope.markers.box.lat, 
            lng: $scope.markers.box.lng, 
            desc: $scope.newItem.short, 
            descLong: $scope.newItem.long, 
            date: $scope.newItem.date,
            contact: $scope.newItem.contact
          });
          $location.path('/map');
        }

      };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
      };

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.initDate = new Date('2016-15-20');
      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];

    }]);