console.log("script.js is loaded");

let map, directionsService, directionsRenderer;
let routeData; 

window.initMap = function () { 
    mapOptions = { 
        center: { lat: 0, lng: 0 }, 
        zoom: 2
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
}


async function getRoute() { // OpenAI API
    try {
        console.log("getRoute function called");

        const description = document.getElementById('description').value;

        response = await fetch('https://routegenie.onrender.com/generate-roadtrip', {
            method: "POST", // send data
            headers: { 'Content-Type': 'application/json' }, // need a header when sending json
            body: JSON.stringify({ prompt: description })
        })

        // response return a Reponse object, extract with await response.json()
        result = await response.json();
        // even though result is a json, output_text is only a string that looks like a json. so make it into a real json.
        const data = JSON.parse(result.output_text); 
        console.log(data.outputDescription)

        const routeDesc = document.getElementById('routeDescription')
        routeDesc.textContent = data.outputDescription

        populateMap(data)


    } catch (err) {
        console.error(err.message);
    }
}


function populateMap(data) {
    routeData = data
    if (!routeData) {
        console.log("No route data available");
        return;
    }

    const start = routeData.origin; 
    const end = routeData.destination; 
    const waypoints = routeData.waypoints.map(waypoint => ({
        location: waypoint.location,
        stopover: waypoint.stopover
    }));

    request = {
        origin: start,
        destination: end,
        waypoints: waypoints,
        optimizeWaypoints: true,
        avoidFerries: true,
        travelMode: google.maps.TravelMode.DRIVING // app limited only to driving
    };

    directionsService.route(request, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            // window.alert('Directions request failed due to ' + status);
            window.alert('Location not found or is inaccessible, please try again. Error: ' + status);
            return;
        }
    });
}