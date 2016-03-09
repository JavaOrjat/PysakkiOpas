PysakkiopasApp.service("StopsService", function() {
    // stops is a one massive string?
	this.stops = "";
	
    this.init = function() {
        var client = new XMLHttpRequest();
        client.open('GET', 'app/components/main/stops.txt');
        client.onreadystatechange = function () {
            this.text = client.responseText;
        };
        client.send();
    }
    
	this.getStops = function() {
		return this.stops;
	}
    
    this.init();
})