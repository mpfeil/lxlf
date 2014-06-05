'use strict';

angular.module('lxlfApp')
  .controller('MapCtrl', ['$scope', 'lxlfFactory', 'leafletData',
    function($scope, lxlfService, leafletData) {
      var drawnItems = new L.FeatureGroup(),
          options = {
            edit: {
              featureGroup: drawnItems,
              remove: false,
              edit: false
            },
            draw: {
              polyline: false,
              polygon: false,
              circle: false,
              rectangle: false,

            }
          },
          drawControl = new L.Control.Draw(options);

      L.drawLocal.draw.toolbar.buttons.marker = 'Add new Lost & Found';
      L.drawLocal.draw.handlers.marker.tooltip.start = 'Click to place marker!';

      var filterControl = L.control();
      filterControl.setPosition('topleft');
      filterControl.onAdd = function () {
          var className = 'leaflet-control-my-location',
              container = L.DomUtil.create('div', className + ' leaflet-bar leaflet-control');
          var link = L.DomUtil.create('a', ' ', container);
          link.href = '#';
          L.DomUtil.create('i','fa fa-list fa-lg', link);

          L.DomEvent
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', function(){
              $scope.filter = true;
            });

          return container;
      };

      $scope.controls = {
        custom: [ drawControl, filterControl ]
      };

      $scope.filter = false;

      leafletData.getMap().then(function(map){
        map.addLayer(drawnItems);

        map.on('draw:created', function(e){
          var layer = e.layer;
          $scope.newLFMarker.lat = layer._latlng.lat;
          $scope.newLFMarker.lng = layer._latlng.lng;
          layer.on('dragend', function(e){
            $scope.newLFMarker.lat = e.target._latlng.lat;
            $scope.newLFMarker.lng = e.target._latlng.lng;
          });
          layer.options.draggable = true;
          drawnItems.addLayer(layer);
          $scope.newLF = true;
          $scope.selected = false;
        });
      });

      $scope.markers = [];
      $scope.selectedMarker;
      $scope.selected = false;
      $scope.newLF = false;
      $scope.oneAtATime = true;
      $scope.submitted = false;

      $scope.newLFMarker = {
        lat: 52,
        lng: 7,
      };

      $scope.cancelForm = function() {
        $scope.newLF = false;
        $scope.newItem.category = '';
        $scope.newItem.short = '';
        $scope.newItem.long = '';
        $scope.newItem.date = '';
        $scope.newItem.tags = 0;
        $scope.newItem.contact = 0;
        $scope.submitted = false;
        leafletData.getMap().then(function(map){
          drawnItems.clearLayers();
        });
      };

      // function to submit the form after all validation has occurred      
      $scope.submitForm = function(isValid) {

        $scope.submitted = true;

        // check to make sure the form is completely valid
        if (isValid) {
          lxlfService.$add({
            lat: $scope.newLFMarker.lat,
            lng: $scope.newLFMarker.lng,
            desc: $scope.newItem.short,
            descLong: $scope.newItem.long,
            date: $scope.newItem.date,
            tags: $scope.newItem.tags,
            category: $scope.newItem.category,
            contact: $scope.newItem.contact
          });
          $scope.newLF = false;
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

      $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
      };

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
        marker.category = entry.snapshot.value.category;
        marker.tags = entry.snapshot.value.tags.map(function(elem){
          return elem.text;
        }).join(", ");
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
            marker.tags = entry.snapshot.value.tagsmap(function(elem){
              return elem.text;
            }).join(",");
            $scope.markers[i] = marker;
            break;
          }
        }
        if ($scope.selectedMarker.title === entry.snapshot.name) {
          $scope.selectedMarker = marker;
        }
      });

      $scope.predicate = '';

      $scope.closeDetails = function() {
        $scope.selected = false;
        $scope.selectedMarker.length = 0;
      };

      $scope.closeFilter = function() {
        $scope.filter = false;
      };

      $scope.formatTime = function(time) {
        var date = new Date(time);
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();

        return [day, month, year].join('/');
      };

      $scope.lostOrFound = function(marker) {
        if (marker.category === 'found') {
          return 'success';
        } else if (marker.category === 'lost') {
          return 'danger';
        } else {
          return 'warning';
        }
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
          // alert('Synchronization failed.');
        } else {
          $scope.comment = false;
          $scope.name = '';
          $scope.body = '';
        }
      };

      $scope.formatTags = function(tags) {
        console.log(tags);
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