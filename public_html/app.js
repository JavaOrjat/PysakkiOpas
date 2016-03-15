var text, skipAmount = 0, lat, lng, directionsService, directionsDisplay;
var client = new XMLHttpRequest();
client.open('GET', 'stops.txt');
client.onreadystatechange = function () {
    text = client.responseText;
};
client.send();

function initialize() {
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
            closestStop();
            map.setCenter(pos);
        });
    }
    google.maps.event.addListener(map, "rightclick", function (event) {
        lat = event.latLng.lat();
        lng = event.latLng.lng();
        skipAmount = 0;
        document.getElementById('coordinates').innerHTML = "lat: " + lat + ", lng: " + lng;
        directionsDisplay.setMap(map);
        closestStop();
    });
}

function closestStop() {
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


    calculateAndDisplayRoute(s.lat, s.lng);
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


}

function calculateAndDisplayRoute(closestLat, closestLng) {

    directionsService.route({
        origin: new google.maps.LatLng(lat, lng),
        destination: new google.maps.LatLng(closestLat, closestLng),
        travelMode: google.maps.TravelMode.WALKING,
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setOptions({preserveViewport: true});
            directionsDisplay.setDirections(response);
            document.getElementById('distance').innerHTML = "Matkan pituus: " + directionsDisplay.directions.routes[0].legs[0].distance.text;
        } else {
        }
    });
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
document.getElementById("closest").addEventListener("click", function () {
    skipAmount = 0;
    closestStop();
});
document.getElementById("search").addEventListener("click", function () {
    var waypoints = getRoute(document.getElementById("info").innerHTML.substr(15), document.getElementById("input").value);
    closestStop(waypoints);
});


function getTimes(stopId) {
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

function getRoute(from, to) {
    var xhr = new XMLHttpRequest();
    var str = "http://api.reittiopas.fi/hsl/prod/?request=geocode&key=" + to + "&user=usertoken3&pass=b98a495a3ba&format=json"
    xhr.open("GET", str, false);
    xhr.send();
    var json = xhr.responseText, obj = JSON.parse(json), to = obj[0].coords;

    var str = "http://api.reittiopas.fi/hsl/prod/?request=geocode&key=" + from + "&user=usertoken3&pass=b98a495a3ba&format=json"
    xhr.open("GET", str, false);
    xhr.send();
    var json = xhr.responseText, obj = JSON.parse(json), from = obj[0].coords;

    var xhr = new XMLHttpRequest();
    var str = "http://api.reittiopas.fi/hsl/prod/?request=route&from=" + from + "&to=" + to + "&user=usertoken3&pass=b98a495a3ba";
    xhr.open("GET", str, false);
    xhr.send();
    console.log("http://api.reittiopas.fi/hsl/prod/?request=route&from=" + from + "&to=" + to + "&user=usertoken3&pass=b98a495a3ba&transport_types=bus|walk");
    var json = xhr.responseText;
    var obj = JSON.parse(json);
    var waypoints = [];
    for (var i = 0, max = obj[0][0].legs.length; i < max; i++) {
        var leg = obj[0][0].legs[i];
        for (var j = 0, max = leg.locs.length; j < max; j++) {
            console.log(leg.locs[j].name);
            waypoints.push(leg.locs[j].name);
        }

    }


    return waypoints;
}