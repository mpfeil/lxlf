'use strict';

angular.module('lxlfApp')
  .controller('MapCtrl', ['$scope', 'lxlfFactory',
    function($scope, lxlfService) {

      $scope.markers = [];
      $scope.selectedMarker;
      $scope.selected = false;

      lxlfService.$on('child_added', function(entry){
        var marker = {};
        marker.lat = entry.snapshot.value.lat;
        marker.lng = entry.snapshot.value.lng;
        marker.title = entry.snapshot.name;
        marker.date = entry.snapshot.value.date;
        marker.desc = entry.snapshot.value.desc;
        marker.descLong = entry.snapshot.value.descLong;
        marker.contact = entry.snapshot.value.contact;
        marker.comments = entry.snapshot.value.comments;
        $scope.markers.push(marker);
      });

      lxlfService.$on('child_changed', function(entry){
        console.log('child changed');
        console.log(entry);
        var marker = {};
        for (var i = $scope.markers.length - 1; i >= 0; i--) {
          if ($scope.markers[i].title === entry.snapshot.name) {
            marker.lat = entry.snapshot.value.lat;
            marker.lng = entry.snapshot.value.lng;
            marker.title = entry.snapshot.name;
            marker.date = entry.snapshot.value.date;
            marker.desc = entry.snapshot.value.desc;
            marker.descLong = entry.snapshot.value.descLong;
            marker.contact = entry.snapshot.value.contact;
            marker.comments = entry.snapshot.value.comments;
            $scope.markers[i] = marker;
            break;
          }
        }
        if ($scope.selectedMarker.title === entry.snapshot.name) {
          $scope.selectedMarker = marker;
        }
      });

      $scope.closeDetails = function() {
        $scope.selected = false;
        $scope.selectedMarker.length = 0;
      };

      $scope.formatTime = function(time) {
        var date = new Date(time);
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();

        return [day, month, year].join('/');
      };

      $scope.addComment = function() {
        $scope.comment = !$scope.comment;
      };

      $scope.center = {
        lat: 40.095,
        lng: -3.823,
        zoom: 4
      };

      $scope.getCommentCount = function(comments) {
        if (comments !== undefined) {
          return comments.length;
        } else {
          return '0';
        }
        
      };

      $scope.onComplete = function(error) {
        if (error) {
          alert('Synchronization failed.');
        } else {
          $scope.comment = false;
        }
      };

      $scope.submitComment = function(marker) {
        var ref = new Firebase('https://lxlf.firebaseio.com/lost/'+marker.title);
        var commentsArray = [];
        if ($scope.selectedMarker.comments !== undefined) {
          commentsArray = angular.copy($scope.selectedMarker.comments);
        }
        commentsArray.push({name:$scope.name,body:$scope.body,date: new Date()});
        ref.update({comments: commentsArray}, $scope.onComplete);
      };

      $scope.zoomTo = function(lat,lng) {
        $scope.center.lat = lat;
        $scope.center.lng = lng;
        $scope.center.zoom = 18;
      };

      $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        // Args will contain the marker name and other relevant information
        for (var i = $scope.markers.length - 1; i >= 0; i--) {
          if ($scope.markers[i].title === args.leafletEvent.target.options.title) {
            $scope.selectedMarker = $scope.markers[i];
            break;
          }
        }
        $scope.selected = true;
      });
    }
  ]);