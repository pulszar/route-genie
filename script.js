let map, directionsService, directionsRenderer;
let routeData; 

function initMap() { 
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 }, 
        zoom: 2
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
}

async function getRoute() { // OpenAI API
    try {
        console.log("getRoute function called");

        const description = document.getElementById('description').value;

        response = await fetch('http://localhost:4000/generate-roadtrip', {
            method: "POST", // send data
            headers: { 'Content-Type': 'application/json' }, // need a header when sending json
            body: JSON.stringify({ prompt: description })
        })

        // response return a Reponse object, extract with await response.json()
        result = await response.json();

        const data = JSON.parse(result.choices[0].message.content);

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

    directionsService.route({
        origin: start,
        destination: end,
        waypoints: waypoints,
        optimizeWaypoints: true,
        avoidFerries: true,
        travelMode: google.maps.TravelMode.DRIVING // app limited only to driving
    }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);
        } else {
            // window.alert('Directions request failed due to ' + status);
            window.alert('Location not found or is inaccessible, trying again... Error: ' + status);
            getRoute();
        }
    });
}