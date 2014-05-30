'use strict';

angular.module('lxlfApp')
  .controller('NewCtrl', function ($scope) {
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
			alert('our form is amazing');
		}

	};
  });
