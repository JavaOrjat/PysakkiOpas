var text;
var client = new XMLHttpRequest();
client.open('GET', 'stops.txt');
client.onreadystatechange = function () {
    text = client.responseText;
};
client.send();

function initialize() {
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.preserveViewport = true;
    var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(60.174280, 24.960710)
    };
    var map = new google.maps.Map(
            document.getElementById('map-canvas')
            , mapOptions);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            directionsDisplay.setMap(map);
            closestStop(directionsService, directionsDisplay, position.coords.latitude, position.coords.longitude);
            map.setCenter(pos);
        });
    }

    google.maps.event.addListener(map, "rightclick", function (event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        document.getElementById('coordinates').innerHTML = "lat: " + lat + ", lng: " + lng;
        directionsDisplay.setMap(map);
        closestStop(directionsService, directionsDisplay, lat, lng);
    });
}
function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=initialize';
    document.body.appendChild(script);
}
window.onload = loadScript;

function closestStop(directionsService, directionsDisplay, lat, lng) {
    var count = 0;
    var closestLat = 99;
    var closestLng = 99;
    var closestStopName = "";
    var currentStop = "";
    var link = "";
    for (var i = 0, max = text.length; i < max; i++) {
        if (text.charAt(i) === ",") {
            count++;
        }
        if (count === 3) {
            currentStop = currentStop + text.charAt(i);
        }
        if (count === 4) {
            var currentStopLat = parseFloat(text.substr(i + 1, 9));
            var currentStopLng = parseFloat(text.substr(i + 11, 9));

            var currentLatDifference = Math.abs(currentStopLat - lat);
            var currentLngDifference = Math.abs(currentStopLng - lng);

            var closestLatDifference = Math.abs(closestLat - lat);
            var closestLngDifference = Math.abs(closestLng - lng);

            if ((currentLatDifference + currentLngDifference) < (closestLatDifference + closestLngDifference)) {
                closestLat = currentStopLat;
                closestLng = currentStopLng;
                closestStopName = currentStop;
                link = text.substr(i + 23, 48);
            }
            count++;
            i = i + 20;
            currentStop = "";
        }
        if (count === 10) {
            count = 0;
        }
    }

    closestStopName = closestStopName.substr(2, closestStopName.length - 3);
    document.getElementById('info').innerHTML = "Lähin pysäkki: " + closestStopName;
    var a = document.getElementById('top');
    a.innerHTML = "Pysäkin aikataulut (ohjaa HSL:n sivuille)";
    a.href = link;
    console.log(link);
    calculateAndDisplayRoute(directionsService, directionsDisplay, closestLat, closestLng, lat, lng);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, closestLat, closestLng, lat, lng) {
    directionsService.route({
        origin: new google.maps.LatLng(lat, lng),
        destination: new google.maps.LatLng(closestLat, closestLng),
        travelMode: google.maps.TravelMode.WALKING
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setOptions({preserveViewport: true});
            directionsDisplay.setDirections(response);
            document.getElementById('distance').innerHTML = "Matkan pituus: " + directionsDisplay.directions.routes[0].legs[0].distance.text;
        } else {
        }
    });
}
