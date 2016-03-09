PysakkiopasApp.service("RouteService", function($http) {

    this.closestStop = function() {
        console.log("closest stop!");
    }

// criminally abhorrent method    
    this.closestStop2 = function(stops) {
        // the object to be returned
        var stop = {};
        
        var count = 0, currentStop = "", currentStop = "", link = "", stack = [], id = "";

        for (var i = 0, max = stops.length; i < max; i++) {
            if (stops.charAt(i) === ",")
                count++;
            if (count === 0) {
                id = id + stops.charAt(i);
            }
            if (count === 3)
                currentStop = currentStop + stops.charAt(i);
            if (count === 4) {
                var currentStopLat = parseFloat(stops.substr(i + 1, 9)), currentStopLng = parseFloat(stops.substr(i + 11, 9));
                var currentLatDifference = Math.abs(currentStopLat - lat), currentLngDifference = Math.abs(currentStopLng - lng);

                link = stops.substr(i + 23, 48);
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
    
    this.getRoute = function(info, input) {
        console.log("getroute!");
    }
})