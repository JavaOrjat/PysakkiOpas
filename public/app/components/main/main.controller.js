PysakkiopasApp.controller("MainController", function($scope, StopsService, RouteService) {
    var skipAmount = 0;
    var lat;
    var lng;
    var directionsService;
    var directionsDisplay;
    
    $scope.coordinates = "lat: x, lng: y";
    $scope.info = "";
    $scope.input = "";
    
    // stops are fetched locally from stops.txt file
    $scope.stops = StopsService.getStops();
    
    $scope.init = function() {
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        var mapOptions = {
            zoom: 16,
            center: new google.maps.LatLng(60.174280, 24.960710)
        };
        var map = new google.maps.Map(
                document.getElementById('map-canvas'), mapOptions);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                directionsDisplay.setMap(map);
                $scope.closestStop();
                map.setCenter(pos);
            });
        }
        google.maps.event.addListener(map, "rightclick", function (event) {
            lat = event.latLng.lat();
            lng = event.latLng.lng();
            skipAmount = 0;
            // document.getElementById('coordinates').innerHTML = "lat: " + lat + ", lng: " + lng;
            $scope.coordinates = "lat: " + lat + ", lng: " + lng;
            directionsDisplay.setMap(map);
            $scope.closestStop();
        });
    }
    
    $scope.nextStop = function() {
        skipAmount++;
        RouteService.closestStop();
    }
    
    $scope.previousStop = function() {
        if (skipAmount > 0) {
            skipAmount--;
        }
        RouteService.closestStop();
    }
    
    $scope.closestStop = function() {
        skipAmount = 0;
        RouteService.closestStop();
    }
    
    $scope.searchStop = function() {
        RouteService.getRoute($scope.info, $scope.input);
    }
})