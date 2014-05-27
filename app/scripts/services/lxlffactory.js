'use strict';

angular.module('lxlfApp')
  .factory('lxlfFactory', function () {
    var ref = new Firebase("https://lxlf.firebaseio.com/lost");

    // Public API here
    return {
      getMarkers: function() {
        var markers = [];
        ref.on("child_added", function(snapshot) {
          var marker = {};
          marker.lat = snapshot.val().lat;
          marker.lng = snapshot.val().lng;
          markers.push(marker);
        });
        return markers;
      },
      addMarker: function(marker) {
        ref.push(marker);
      }
    }
  });
