
function initialize() {
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.preserveViewport = true;
    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(60.174280, 24.960710)
    };

    var map = new google.maps.Map(
            document.getElementById('map-canvas')
            , mapOptions);
    google.maps.event.addListener(map, "rightclick", function (event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        document.getElementById('coordinates').innerHTML = "lat: " + lat + ", lng: " + lng;
        directionsDisplay.setMap(map);
        parseStops(directionsService, directionsDisplay, lat, lng);


    });
}
function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=initialize';
    document.body.appendChild(script);
}

window.onload = loadScript;

function parseStops(directionsService, directionsDisplay, lat, lng) {
    var client = new XMLHttpRequest();
    client.open('GET', 'stops.txt');
    client.onreadystatechange = function () {
        closestStop(client.responseText, directionsService, directionsDisplay, lat, lng);

    };
    client.send();
}
function closestStop(stops, directionsService, directionsDisplay, lat, lng) {
    var count = 0;
    var closestLat = 99;
    var closestLng = 99;
    var closestStopName = "";
    var currentStop = "";
    var link = "";
    for (var i = 0, max = stops.length; i < max; i++) {
        if (stops.charAt(i) === ",") {
            count++;
        }
        if (count === 3) {
            currentStop = currentStop + stops.charAt(i);

        }
        if (count === 4) {
            var currentStopLat = parseFloat(stops.substr(i + 1, 9));
            var currentStopLng = parseFloat(stops.substr(i + 11, 9));
            
            var currentLatDifference = Math.abs(currentStopLat - lat);
            var currentLngDifference = Math.abs(currentStopLng - lng);
            
            var closestLatDifference = Math.abs(closestLat - lat);
            var closestLngDifference = Math.abs(closestLng - lng);
            
            if ((currentLatDifference+currentLngDifference) < (closestLatDifference+closestLngDifference)) {
                closestLat = currentStopLat;
                closestLng = currentStopLng;
                closestStopName = currentStop;
                link = stops.substr(i + 23, 48);
            }
            count++;
            i = i + 20;
            currentStop = "";
        }

        if (count === 10) {
            count = 0;
        }
        if (i === stops.length) {
            stopLng = closestLng;
            stopLat = closestLat;
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
            directionsDisplay.setDirections(response);
        } else {

        }
    });

}