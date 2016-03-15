var text, skipAmount = 0, lat, lng, directionsService, directionsDisplay
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
    var mapOptions = {
        zoom: 16,
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
            closestStop();
            map.setCenter(pos);
        });
    }

    document.getElementById("search").addEventListener("click", function () {

        var segments = getRoute(document.getElementById("input").value);
        var waypts = [];

        var batches = [];
        var waypoints = [];
        for (var i = 0, max = segments.length; i < max; i++) {
            var segment = segments[i];
            if (segment == null) {
                continue;
            }
            for (var j = 0, max = segment.waypoints.length; j < max; j++) {
                waypoints.push(segment.waypoints[j]);
            }
        }
        waypoints.reverse();
        while (true) {
            var b = new batch([]);
            for (var i = 0, max = 10; i < max; i++) {
                if (waypoints.length === 0) {
                    break;
                }
                b.waypoints.push(waypoints.pop());
            }
            batches.push(b);
            if (waypoints.length === 0) {
                break;
            }
        }


        for (var i = 0, max = batches.length - 1; i < max; i++) {
            var batchy = batches[i];
            if (batchy == null) {
                break;
            }
            var eka = batchy.waypoints[0].split(",");
            for (var j = 1, max = batchy.waypoints.length - 1; j < max; j++) {
                var coordy = batchy.waypoints[j].split(",");
                waypts.push({
                    location: new google.maps.LatLng(coordy[1], coordy[0]),
                    stopover: true
                });
            }
            var vika = batchy.waypoints[batchy.waypoints.length - 1].split(",");
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer();
            directionsDisplay.setOptions( { suppressMarkers: true } );
            directionsDisplay.setMap(map);
            calculateAndDisplayRoute2(eka[1], eka[0], vika[1], vika[0], waypts, directionsDisplay, directionsService);
            waypts = [];

        }

    });
    google.maps.event.addListener(map, "rightclick", function (event) {

        lat = event.latLng.lat();
        lng = event.latLng.lng();
        skipAmount = 0;
        document.getElementById('coordinates').innerHTML = "lat: " + lat + ", lng: " + lng;

        directionsDisplay.setMap(map);
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
function batch(waypoints) {
    this.waypoints = waypoints;
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

    calculateAndDisplayRoute(lat, lng, s.lat, s.lng);
}

function calculateAndDisplayRoute(lat, lng, closestLat, closestLng, waypts) {

    directionsService.route({
        origin: new google.maps.LatLng(lat, lng),
        destination: new google.maps.LatLng(closestLat, closestLng),
        travelMode: google.maps.TravelMode.WALKING,
        waypoints: waypts
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setOptions({preserveViewport: true});
            directionsDisplay.setDirections(response);
            document.getElementById('distance').innerHTML = "Matkan pituus: " + directionsDisplay.directions.routes[0].legs[0].distance.text;
        } else {
        }
    });
}
function calculateAndDisplayRoute2(lat, lng, closestLat, closestLng, waypts, directionsDisplay, directionsService) {

    directionsService.route({
        origin: new google.maps.LatLng(lat, lng),
        destination: new google.maps.LatLng(closestLat, closestLng),
        travelMode: google.maps.TravelMode.WALKING,
        waypoints: waypts
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setOptions({preserveViewport: true});
            directionsDisplay.setDirections(response);
            document.getElementById('distance').innerHTML = "Matkan pituus: " + directionsDisplay.directions.routes[0].legs[0].distance.text;
        } else {
        }
    });
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
    //ask api for coordinates for "to" (input div in html)
    var str = "http://api.reittiopas.fi/hsl/prod/?request=geocode&key=" + to +
            "&user=usertoken3&pass=b98a495a3ba&format=json&epsg_out=4326";
    xhr.open("GET", str, false);
    xhr.send();
    var json = xhr.responseText, obj = JSON.parse(json), to = obj[0].coords;

    //ask api for route "from -> to"
    var from = lng + "," + lat;
    var str = "http://api.reittiopas.fi/hsl/prod/?request=route&from=" + from +
            "&to=" + to + "&user=usertoken3&pass=b98a495a3ba&epsg_in=4326&epsg_out=4326";
    xhr.open("GET", str, false);
    xhr.send();
    var json = xhr.responseText;
    var obj = JSON.parse(json);

    var segments = [];
    ;
    document.getElementById('arrivals').innerHTML = "Reittiohjeet:";
    document.getElementById('bustimes').innerHTML = "";
    var para = document.createElement("p");
    //loop goes through json and cuts the route in "segments"
    for (var i = 0, max = obj[0][0].legs.length; i < max; i++) {
        var waypoints = [];
        var leg = obj[0][0].legs[i];
        if (leg == null) {
            continue;
        }
        var type = leg.type, start = leg.locs[0].name, end = leg.locs[leg.locs.length - 1].name, code = leg.code, starttime = leg.locs[0].depTime.substr(8), endtime = leg.locs[leg.locs.length - 1].arrTime.substr(8);
        for (var j = 0, max = leg.locs.length; j < max; j++) {
            waypoints.push(leg.locs[j].coord.x + "," + leg.locs[j].coord.y);
        }
        segments.push(new segment(start, end, starttime, endtime, code, type, waypoints));
        if (type === "walk") {
            code = "kävele";
        } else {
            if (code.substr(0, 2) === "10") {
                code = code.substr(2, code.length - 4);
            }
            if (code.charAt(0) === "2") {
                code = code.substr(1, code.length - 4);
            }
        }

        //get name for start or end coordinates
        if (start === null || end === null) {
            var xml = new XMLHttpRequest(), startOrEnd, coords;
            if (start === null) {
                startOrEnd = true;
                coords = waypoints[0];
            }
            if (end === null) {
                startOrEnd = false;
                coords = waypoints[waypoints.length - 1];
            }
            var string = "http://api.reittiopas.fi/hsl/prod/?request=reverse_geocode&coordinate=" +
                    coords + "&user=usertoken3&pass=b98a495a3ba&format=json&epsg_in=4326";
            xml.open("GET", string, false);
            xml.send();
            var json2 = xml.responseText, obj2 = JSON.parse(json2);
            //cut helsinki from response
            if (startOrEnd) {
                start = obj2[0].name;
                var cutCity = start.search("Helsinki");
                if (cutCity > 0) {
                    start = start.substr(0, start.length - 10);
                }
            } else {
                end = obj2[0].name;
                var cutCity = end.search("Helsinki");
                if (cutCity > 0) {
                    end = end.substr(0, end.length - 10);
                }
            }

        }

        //"Reittiohjeet:"
        var br = document.createElement("br");
        var node = document.createTextNode(starttime.substr(0, 2) + "." + starttime.substr(2, 2) + " / " + start + ": " + code);
        para.appendChild(br);
        para.appendChild(node);
        node = document.createTextNode(" -> " + end + " / " + endtime.substr(0, 2) + "." + endtime.substr(2, 2));
        para.appendChild(br);
        para.appendChild(node);
        node = document.createTextNode("");
        para.appendChild(br);
        para.appendChild(node);
        var element = document.getElementById("bustimes");
        element.appendChild(para);
    }


    return segments;
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