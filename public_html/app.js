var text, skipAmount = 0, lat, lng, directionsService, directionsDisplay, directionsDisplays = [];
var map;
var markers = [];
var client = new XMLHttpRequest();
client.open('GET', 'stops.txt');
client.onreadystatechange = function () {
    text = client.responseText;
};
client.send();

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
            document.getElementById('origininput').value = getLocationName();
            closestStop();
            map.setCenter(pos);
        });
    }

    document.getElementById("search").addEventListener("click", function () {
        for (var i = 0, max = directionsDisplays.length; i < max; i++) {
            directionsDisplays[i].setMap(null);
        }
        document.getElementById("bustimes").innerHTML = "";
        document.getElementById("arrivals").innerHTML = "Reittiohjeet: "


        var segments = getRoute(document.getElementById("input").value);
        var lats = segments[0].split(",");
        var lngs = segments[1].split(",");
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplays.push(directionsDisplay);
        directionsDisplay.setOptions({suppressMarkers: true});
        directionsDisplay.setMap(map);
        calculateAndDisplayRoute(lats[1], lats[0], lngs[1], lngs[0], directionsDisplay, directionsService);

    });

    google.maps.event.addListener(map, "rightclick", function (event) {
        for (var i = 0, max = directionsDisplays.length; i < max; i++) {
            directionsDisplays[i].setMap(null);
        }
        lat = event.latLng.lat();
        lng = event.latLng.lng();
        skipAmount = 0;
        document.getElementById('coordinates').innerHTML = "lat: " + lat + ", lng: " + lng;
        directionsDisplay.setMap(map);
        document.getElementById('origininput').value = getLocationName();
        closestStop();
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
function closestStop() {
    //tää pitää korjaa
    var count = 0, currentStop = "", currentStop = "", link = "", stack = [], id = "";

    for (var i = 0, max = text.length; i < max; i++) {
        if (text.charAt(i) === ",")
            count++;
        if (count === 0) {
            id = id + text.charAt(i);
        }
        if (count === 3)
            currentStop = currentStop + text.charAt(i);
        if (count === 4) {
            var currentStopLat = parseFloat(text.substr(i + 1, 9)), currentStopLng = parseFloat(text.substr(i + 11, 9));
            var currentLatDifference = Math.abs(currentStopLat - lat), currentLngDifference = Math.abs(currentStopLng - lng);

            link = text.substr(i + 23, 48);
            currentStop = currentStop.substr(2, currentStop.length - 3);
            var newStop = new stop(currentStopLat, currentStopLng, currentStop, link, (currentLatDifference + currentLngDifference), id);
            stack.push(newStop), count++, i = i + 20, currentStop = "", id = "";

        }
        if (count === 10)
            count = 0;
    }

    stack.sort(function (a, b) {
        return b.difference - a.difference;
    });
    for (var i = 0, max = skipAmount; i < max; i++) {
        stack.pop();
    }
    var s = stack.pop();

    document.getElementById('info').innerHTML = "Lähin pysäkki: " + s.name;
    var a = document.getElementById('top');
    a.innerHTML = "Pysäkin aikataulut (ohjaa HSL:n sivuille)";
    a.href = s.link;



    var timeTable = getTimes(s.id);
    var old = document.getElementById("bustimes"), loops = timeTable.length;
    old.innerHTML = "";
    if (loops === 0) {
        document.getElementById("bustimes").innerHTML = "Ei löytynyt aikoja seuraavaan kahteen tuntiin."
    }
    for (var i = 0, max = loops; i < max; i++) {
        var para = document.createElement("p");
        var bus = timeTable[i].bus, b = timeTable[i].bus;
        if (b.charAt(1) === '0') {
            bus = b.substr(2, 2);
        } else if (b.charAt(3).match(/[a-z]/i)) {
            bus = b.substr(0, 3);
        } else {
            bus = b.substr(1, 4);
        }
        var time = timeTable[i].time, hours, minutes;
        if (time.length === 4) {
            hours = time.substr(0, 2);
            minutes = time.substr(2, 2);
            if (hours === "24") {
                hours = 00;
            } else if (hours === "25") {
                hours = 01;
            }
        } else {
            hours = time.substr(0, 1);
            minutes = time.substr(1, 2);
        }

        var node = document.createTextNode(bus + " / " + hours + ":" + minutes + " --> " + timeTable[i].destination);
        para.appendChild(node);
        var element = document.getElementById("bustimes");
        element.appendChild(para);
    }
    for (var i = 0, max = directionsDisplays.length; i < max; i++) {
        directionsDisplays[i].setMap(null);
    }
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplays.push(directionsDisplay);
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(lat, lng, s.lat, s.lng, directionsDisplay, directionsService);
}

function calculateAndDisplayRoute(lat, lng, closestLat, closestLng, directionsDisplay, directionsService) {
    directionsService.route({
        origin: new google.maps.LatLng(lat, lng),
        destination: new google.maps.LatLng(closestLat, closestLng),
        travelMode: google.maps.TravelMode.TRANSIT
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
//            directionsDisplay.setOptions({preserveViewport: true});
            directionsDisplay.setDirections(response);
            getInfo(directionsDisplay.directions);
            document.getElementById('distance').innerHTML = "Matkan pituus: " + directionsDisplay.directions.routes[0].legs[0].distance.text;
        } else {
        }
    });
}

function getInfo(response) {
    var leg = response.routes[0].legs[0];
    console.log(leg);
//    console.log("lähtö: "+route);
    var para = document.createElement("p");
    for (var i = 0, max = leg.steps.length; i < max; i++) {
        var depTime = "", arrTime = "", line = "", arrStop = "", depStop = "", finalTime = "";
        ;
        var step = leg.steps[i];
        if (leg.steps[i].transit == null) {
            if (leg.departure_time != null && i === 0) {
                depTime = leg.departure_time.text + " / ";
            } else  if (leg.departure_time != null && i !== 0){
                depTime = leg.steps[i-1].transit.arrival_time.text+" / ";
            }
            arrTime = " (matkaa: "+leg.steps[i].distance.text+")";
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
        if (i === max-1 && leg.arrival_time != null) {
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
        var element = document.getElementById("bustimes");
        element.appendChild(para);
    }
}

document.getElementById("next").addEventListener("click", function () {
    skipAmount++;
    closestStop();
});
document.getElementById("previous").addEventListener("click", function () {
    if (skipAmount > 0) {
        skipAmount--;
    }
    closestStop();
});

function getTimes(stopId) {
    //tää pitää korjaa
    var xhr = new XMLHttpRequest();
    var str = "http://api.reittiopas.fi/hsl/prod/?request=stop&dep_limit=10&user=usertoken3&pass=b98a495a3ba&format=txt&code=" + stopId;
    xhr.open("GET", str, false);
    xhr.send();
    var txt = xhr.responseText;

    var index = txt.search("departures"), txt = txt.substr(index), i = txt.search("code") + 9;
    var index = i - 9, busCount = 0, json2 = txt;
    var timeTable = [];
    while (index !== -1) {
        busCount++;
        json2 = json2.substring(index + 1);
        index = json2.search("code");
    }

    for (var j = 0, max = busCount - 1; j < max; j++) {
        txt = txt.substr(i);
        var bus = new busTime(txt.substr(0, 4), txt.substr(46, 4));
        timeTable.push(bus);
        txt = txt.substr(50);
        i = txt.search("code") + 9;
    }
    json2 = xhr.responseText;
    for (var i = 0, max = timeTable.length; i < max; i++) {
        var bus = timeTable[i];
        var destinationIndex = json2.search("" + bus.bus) + 8;
        timeTable[i].destination = json2.substr(destinationIndex, 18).replace(/ /g, '');
    }
    return timeTable;
}

function getRoute(to) {
    var xhr = new XMLHttpRequest();
    var fromto = [];
    //ask api for coordinates for "to" (input div in html)
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

function getLocationName() {
    var string = "http://api.reittiopas.fi/hsl/prod/?request=reverse_geocode&coordinate=" +
            lng + "," + lat + "&user=usertoken3&pass=b98a495a3ba&format=json&epsg_in=4326";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", string, false);
    xhr.send();
    var json2 = xhr.responseText, obj2 = JSON.parse(json2);
    return obj2[0].name;

}

function segment(start, end, starttime, endtime, code, type, waypoints) {
    this.start = start;
    this.end = end;
    this.starttime = starttime;
    this.endtime = endtime;
    this.buscode = code;
    this.type = type;
    this.waypoints = waypoints;
}
function stop(lat, lng, name, link, difference, id) {
    this.lat = lat;
    this.lng = lng;
    this.name = name;
    this.link = link;
    this.difference = difference;
    this.id = id;
}

function busTime(bus, time) {
    this.bus = bus;
    this.time = time;
    this.destination = "";
}