/* 
  Controller for map page.
*/

'use strict';

angular.module('lxlfApp')
  .controller('MapCtrl', ['$scope', 'lxlfFactory', 'leafletData',
    function($scope, lxlfService, leafletData) {
      
      //defines our drawable layer for creating a new lost or found object
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

      // Change tooltips for drawing tool
      L.drawLocal.draw.toolbar.buttons.marker = 'Add new Lost & Found';
      L.drawLocal.draw.handlers.marker.tooltip.start = 'Click to place marker!';

      //Create our own control for filtering 
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

      //adds the controls to our map
      $scope.controls = {
        custom: [ drawControl, filterControl ]
      };

      //model variables with default values
      $scope.filter = false;
      $scope.securitycode = '';

      //creates the security code for archiving
      function createUUID() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = '0123456789abcdef';
        for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = '-';

        var uuid = s.join('');
        return uuid;
      }

      //map handler to handle new drawings
      leafletData.getMap().then(function(map){
        map.addLayer(drawnItems);

        map.on('draw:created', function(e){
          var layer = e.layer;
          $scope.newLFMarker.lat = layer._latlng.lat;
          $scope.newLFMarker.lng = layer._latlng.lng;
          $scope.securitycode = createUUID();
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

      //model variables with default values
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

      //function to clear variables of new lost or found object form
      function clearNewLFForm() {
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
      }

      $scope.cancelForm = function() {
        clearNewLFForm();
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
            contact: $scope.newItem.contact,
            sec: $scope.securitycode
          });
          $scope.newLF = false;
          clearNewLFForm();
        }
      };

      //helper functions for sidebar
      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
      };

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      //model variables with default values
      $scope.archiveIsCollapsed = true;
      $scope.secName = [];
      $scope.secError = false;
      $scope.secErrorText = '';

      //archive function
      //flags the entry and deletes it from the model
      $scope.archive = function(marker,sec) {
        var secObj = {};
        secObj.name = marker.title;
        secObj.sec = sec;
        var ref = new Firebase('https://lxlf.firebaseio.com/lost/'+marker.title);
        for (var i = $scope.secName.length - 1; i >= 0; i--) {
          if ($scope.secName[i].name === marker.title && $scope.secName[i].sec === sec) {
            ref.update({flag:1}, function(error){
              if (error) {
                $scope.secErrorText = 'Connection problems!';
                $scope.secError = true;    
              } else {
                $scope.secError = false;
                $scope.secErrorText = '';
                $scope.selected = false;
              }
            });
          } else {
            $scope.secErrorText = 'Security code not correct!';
            $scope.secError = true;
          }
        }
      };

      //model variables with default values
      $scope.initDate = new Date('2016-15-20');
      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];

      $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
      };

      /*
        triggered if a new child is added to our database
        syncs the data and keeps it up to date
      */
      lxlfService.$on('child_added', function(entry){
        var secName = {};
        var marker = {};
        if (!entry.snapshot.value.flag) {
          secName.name = entry.snapshot.name;
          secName.sec = entry.snapshot.value.sec;
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
          }).join(', ');
          $scope.markers.push(marker);
          $scope.secName.push(secName);
        }
      });

      /*
        triggered if a child is changed in our database
        syncs the data and keeps it up to date
      */
      lxlfService.$on('child_changed', function(entry){
        if (entry.snapshot.value.flag) {
          for (var i = $scope.markers.length - 1; i >= 0; i--) {
            if ($scope.markers[i].title === entry.snapshot.name) {
              $scope.markers.splice(i,1);
              break;
            }
          }
          $scope.selectedMarker.length = 0;
        } else {
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
              }).join(',');
              $scope.markers[i] = marker;
              break;
            }
          }
          if ($scope.selectedMarker.title === entry.snapshot.name) {
            $scope.selectedMarker = marker;
          }
        }
      });

      //model variables with default values
      $scope.predicate = '';

      //helper function to close sidebar
      $scope.closeDetails = function() {
        $scope.selected = false;
        $scope.selectedMarker.length = 0;
      };

      $scope.closeFilter = function() {
        $scope.filter = false;
      };

      //helper funtion to format timestamp nicely
      $scope.formatTime = function(time) {
        var date = new Date(time);
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();

        return [day, month, year].join('/');
      };

      //categorize objects for filter panel
      $scope.lostOrFound = function(marker) {
        if (marker.category === 'found') {
          return 'success';
        } else if (marker.category === 'lost') {
          return 'danger';
        } else {
          return 'warning';
        }
      };

      //toggles comment form
      $scope.addComment = function() {
        $scope.comment = !$scope.comment;
      };

      //model variables with default values
      $scope.center = {
        lat: 40.095,
        lng: -3.823,
        zoom: 4
      };

      //counts comments
      $scope.getCommentCount = function(comments) {
        if (comments !== undefined) {
          return comments.length;
        } else {
          return '0';
        }
        
      };

      //callback function for submitting data to database
      $scope.onComplete = function(error) {
        if (error) {
          // alert('Synchronization failed.');
        } else {
          $scope.comment = false;
          $scope.name = '';
          $scope.body = '';
        }
      };

      //saves new comment to database
      $scope.submitComment = function(marker) {
        var ref = new Firebase('https://lxlf.firebaseio.com/lost/'+marker.title);
        var commentsArray = [];
        if ($scope.selectedMarker.comments !== undefined) {
          commentsArray = angular.copy($scope.selectedMarker.comments);
        }
        commentsArray.push({name:$scope.name,body:$scope.body,date: new Date()});
        ref.update({comments: commentsArray}, $scope.onComplete);
      };

      //helper function to zoomTo object for filter sidebar
      $scope.zoomTo = function(lat,lng) {
        $scope.center.lat = lat;
        $scope.center.lng = lng;
        $scope.center.zoom = 18;
      };

      //handles click on marker and opens the details sidebar
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