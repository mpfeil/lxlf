'use strict';

angular.module('lxlfApp')
  .controller('MainCtrl', ['$scope', 'lxlfFactory',
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

      $scope.myInterval = 5000;
      var slides = $scope.slides = [];
      $scope.addSlide = function() {
        var newWidth = 800 + slides.length;
        slides.push({
          image: 'http://placekitten.com/' + newWidth + '/300',
          text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
          ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
        });
      };
      for (var i=0; i<4; i++) {
        $scope.addSlide();
      }
    }
  ]);