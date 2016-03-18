var skipAmount = 0, lat, lng, currentStopId, directionsService, directionsDisplay, directionsDisplays = []
        , map, markers = [];

function initialize() {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({suppressMarkers: true});
    var mapOptions = {
        zoom: 16,
        maxZoom: 17,
        center: new google.maps.LatLng(60.174280, 24.960710)
    };
    map = new google.maps.Map(
            document.getElementById('map-canvas'), mapOptions);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            addMarker(pos);
            directionsDisplay.setMap(map);
            document.getElementById('origininput').value = getLocationName(lat, lng);
            closestStops();
            map.setCenter(pos);
        });
    }

    document.getElementById("search").addEventListener("click", function () {
        for (var i = 0, max = directionsDisplays.length; i < max; i++) {
            directionsDisplays[i].setMap(null);
        }
        document.getElementById("destination").innerHTML = "";
        document.getElementById("routes").innerHTML = "";
        document.getElementById("arrivals").innerHTML = "Reittiohjeet: ";


        var segments = getRoute(document.getElementById("destinationinput").value);
        if (segments == null) {
            return;
        }
        var lats = segments[0].split(",");
        var lngs = segments[1].split(",");
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplays.push(directionsDisplay);
//        directionsDisplay.setOptions({suppressMarkers: true});
        directionsDisplay.setMap(map);
        calculateAndDisplayRoute(lats[1], lats[0], lngs[1], lngs[0], directionsDisplay, directionsService);

    });

    google.maps.event.addListener(map, "rightclick", function (event) {
        for (var i = 0, max = directionsDisplays.length; i < max; i++) {
            directionsDisplays[i].setMap(null);
        }
        document.getElementById("routes").innerHTML = "";
        document.getElementById("arrivals").innerHTML = "Reittiohjeet: ";
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        var location = getLocationName(lat, lng);
        document.getElementById("destinationinput").value = location;
        var segments = getRoute(location);
        if (segments == null) {
            return;
        }
        var lats = segments[0].split(",");
        var lngs = segments[1].split(",");
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplays.push(directionsDisplay);
        directionsDisplay.setOptions({suppressMarkers: false});
        directionsDisplay.setMap(map);
        calculateAndDisplayRoute(lats[1], lats[0], lngs[1], lngs[0], directionsDisplay, directionsService);
    });
    google.maps.event.addListener(map, "click", function (event) {
        document.getElementById("bustimes").innerHTML = "";
        document.getElementById("routes").innerHTML = "";
        document.getElementById("destinationinput").value = "";
        for (var i = 0, max = directionsDisplays.length; i < max; i++) {
            directionsDisplays[i].setMap(null);
        }
        lat = event.latLng.lat();
        lng = event.latLng.lng();
        skipAmount = 0;
        directionsDisplay.setOptions({preserveViewport: true});
        directionsDisplay.setMap(map);
        document.getElementById('origininput').value = getLocationName(lat, lng);
        closestStops();
        var pos = {
            lat: lat,
            lng: lng
        };
        addMarker(pos);
    });
    function addMarker(location) {
        setMapOnAll(null);
        markers = [];
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        markers.push(marker);
    }
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }
}

document.getElementById("next").addEventListener("click", function () {
    document.getElementById("bustimes").innerHTML = "";
    document.getElementById("routes").innerHTML = "";
    if (skipAmount < 10) {
        skipAmount++;
        closestStops();
    }
});
document.getElementById("previous").addEventListener("click", function () {
    document.getElementById("bustimes").innerHTML = "";
    document.getElementById("routes").innerHTML = "";
    if (skipAmount > 0) {
        skipAmount--;
    }
    closestStops();
});

function closestStops() {
    var xhr = new XMLHttpRequest();
    var str = "http://api.reittiopas.fi/hsl/prod/?request=stops_area&user=usertoken3&pass=b98a495a3ba&format=json&epsg_out=4326&epsg_in=4326&center_coordinate=" + lng + "," + lat;
    xhr.open("GET", str, false);
    xhr.send();
    var json = xhr.responseText, obj = JSON.parse(json);
    var closest = obj[skipAmount];
    if (closest == null) {
        skipAmount--;
        return;
    }
    var coords = closest.coords.split(",");
    currentStopId = closest.code;
    var link = document.createElement('a');
    var codeShort = document.createTextNode("(" + closest.codeShort + ")");
    link.appendChild(codeShort);
    link.href = "http://aikataulut.reittiopas.fi/pysakit/fi/" + closest.code + ".html"
    document.getElementById("info").innerHTML = "Pysäkki: " + closest.name + " ";
    document.getElementById("info").appendChild(link);
    for (var i = 0, max = directionsDisplays.length; i < max; i++) {
        directionsDisplays[i].setMap(null);
    }
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplays.push(directionsDisplay);
    directionsDisplay.setOptions({preserveViewport: true});
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(lat, lng, coords[1], coords[0], directionsDisplay, directionsService);
}

function calculateAndDisplayRoute(lat, lng, closestLat, closestLng, directionsDisplay, directionsService) {
    directionsService.route({
        origin: new google.maps.LatLng(lat, lng),
        destination: new google.maps.LatLng(closestLat, closestLng),
        travelMode: google.maps.TravelMode.TRANSIT
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            getInfo(directionsDisplay.directions);
            document.getElementById('distance').innerHTML = "Matkan pituus: " + directionsDisplay.directions.routes[0].legs[0].distance.text;
        } else {
        }
    });
}

function getInfo(response) {
    var leg = response.routes[0].legs[0];
    var para = document.createElement("p");
    for (var i = 0, max = leg.steps.length; i < max; i++) {
        var depTime = "", arrTime = "", line = "", arrStop = "", depStop = "", finalTime = "";
        var step = leg.steps[i];
        if (leg.steps[i].transit == null) {
            if (leg.departure_time != null && i === 0) {
                depTime = leg.departure_time.text + " / ";
            } else if (leg.departure_time != null && i !== 0) {
                depTime = leg.steps[i - 1].transit.arrival_time.text + " / ";
            }
            arrTime = " (matkaa: " + leg.steps[i].distance.text + ")";
            line = "Kävele";
            arrStop = step.instructions.substr(8).split(",")[0];
        } else {
            depTime = step.transit.departure_time.text + " / ";
            depStop = step.transit.departure_stop.name + ": ";
            arrTime = " / " + step.transit.arrival_time.text;
            line = step.transit.line.short_name;
            arrStop = step.transit.arrival_stop.name;
            if (line == null) {
                line = "Metro";
            }
        }
        if (i === max - 1 && leg.arrival_time != null) {
            finalTime = " / " + leg.arrival_time.text;
        }
        var br = document.createElement("br");
        var node = document.createTextNode(depTime + depStop + line);
        para.appendChild(br);
        para.appendChild(node);
        node = document.createTextNode(" -> " + arrStop + arrTime + finalTime);
        para.appendChild(br);
        para.appendChild(node);
        node = document.createTextNode("");
        para.appendChild(br);
        para.appendChild(node);
        var element = document.getElementById("routes");
        element.appendChild(para);
    }
}

function getTimes() {
    var xhr = new XMLHttpRequest();
    var str = "http://api.reittiopas.fi/hsl/prod/?request=stop&dep_limit=10&user=usertoken3&pass=b98a495a3ba&format=json&code=" + currentStopId;
    xhr.open("GET", str, false);
    xhr.send();
    var json = xhr.responseText, obj = JSON.parse(json);
    var line = "", time = "", code = "", destination = "";
    var para = document.createElement("p");
    if (obj[0].departures == null) {
        document.getElementById("bustimes").innerHTML = "Ei seuraavaan kahteen tuntiin saapuvia vuoroja.";
    } else {
        for (var i = 0, max = obj[0].departures.length; i < max; i++) {
            var bus = obj[0].departures[i];
            code = bus.code.substr(0, bus.code.length - 3);
            time = "" + bus.time;
            if (code.substr(0, 2) === "10") {
                code = code.substr(2);
            } else if (code.charAt(0) === "4" || code.charAt(0) === "2") {
                code = code.substr(1);
            }
            if (time.substr(0, 2) === "24") {
                time = "01:" + time.substr(2);
            } else if (time.substr(0, 2) === "25") {
                time = "02:" + time.substr(2);
            } else {
                time = time.substr(0, 2) + ":asd" + time.substr(2, 2);
            }
            for (var j = 0, max2 = obj[0].lines.length; j < max2; j++) {
                var line = obj[0].lines[j];
                if (line.search(code) !== -1) {
                    destination = line.split(":")[1];
                }
            }
            var br = document.createElement("br");
            var node = document.createTextNode(code + " / " + time + " -> " + destination);
            para.appendChild(node);
            para.appendChild(br);

            var element = document.getElementById("bustimes");
            element.appendChild(para);
        }
    }
}


function getRoute(to) {
    var xhr = new XMLHttpRequest();
    var fromto = [];
    //ask api for coordinates for "to" (input div in html)
    if (to === "" || to == null) {
        return;
    }
    var str = "http://api.reittiopas.fi/hsl/prod/?request=geocode&key=" + to +
            "&user=usertoken3&pass=b98a495a3ba&format=json&epsg_out=4326";
    xhr.open("GET", str, false);
    xhr.send();
    var json = xhr.responseText, obj = JSON.parse(json), to = obj[0].coords;

    //get coordinates from the address in location input bar
    var location = document.getElementById('origininput').value;
    var xhr = new XMLHttpRequest();
    var str = "http://api.reittiopas.fi/hsl/prod/?request=geocode&key=" + location +
            "&user=usertoken3&pass=b98a495a3ba&format=json&epsg_out=4326";
    xhr.open("GET", str, false);
    xhr.send();
    var json = xhr.responseText, obj = JSON.parse(json), from = obj[0].coords;
    fromto.push(from);
    fromto.push(to);
    return fromto;
}

function getLocationName(lat, lng) {
    var string = "http://api.reittiopas.fi/hsl/prod/?request=reverse_geocode&coordinate=" +
            lng + "," + lat + "&user=usertoken3&pass=b98a495a3ba&format=json&epsg_in=4326";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", string, false);
    xhr.send();
    var json2 = xhr.responseText, obj2 = JSON.parse(json2);
    return obj2[0].name;

}
