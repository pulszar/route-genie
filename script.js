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

    if (routeData) {
        calculateAndDisplayRoute();
    }
}

async function getRoute() { // OpenAI API
    try {
        console.log("getRoute function called");

        const description = document.getElementById('description').value;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer APIKEY`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: `

                    Your input will consist of a user describing what their ideal road trip looks like. Your job is to produce a list of
                    consisting of locations. The locations will consist of an origin, waypoints, and a destination. As a result, the
                    a road trip would start at the origin, continue from top to bottom of the waypoints, then end at the destination.
                    Be as efficient as possible creating this list.
                   
                    Obey the user if they ask for a certain amount of waypoints or specific locations. Otherwise, use your own judgment
                    to generate an appropriate amount of waypoints to match the user's needs.
                   
                    The program currently only supports driving as its mode of transportation, so don't create a route that requires
                    other forms of transportation such as going from the mainland to an island (ex. India -> Maldives). The exception to this is ferries.
                   
                    You will only produce the specific locations and respective country/subdivision.
                   
                    Your output will be in a parsable JSON format. It will be in the following format:
                   
                    {
                    "origin": "New York, NY",
                    "destination": "Los Angeles, CA",
                    "waypoints":
                    [
                        {
                        "location": "Chicago, IL",
                        "stopover": true
                        },
                        {
                        "location": "Denver, CO",
                        "stopover": true
                        }

                    }
                        
                    `},
                    { role: "user", content: description }
                  ],
                max_tokens: 250
            })
        });

        console.log("API response status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response received from OpenAI:", data);

        if (data.choices && data.choices.length > 0) {
            const responseText = data.choices[0].message.content;
            console.log("OpenAI response text:", responseText);

            routeData = JSON.parse(responseText); // JSON data stored to global variable

            const responseElement = document.getElementById('response');
            if (responseElement) {
                responseElement.innerText = JSON.stringify(routeData, null, 2);
            } else {
                console.error("Element not found");
            }

            calculateAndDisplayRoute();

        } else {
            console.log("No choices returned in the response");
        }

    } catch (error) {
        console.error("Error fetching", error);

        const responseElement = document.getElementById('response');
        if (responseElement) {
            responseElement.innerText = 'An error occurred: ' + error.message;
        } else {
            console.error("Element not found");
        }
    }
}

function calculateAndDisplayRoute() {
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
        travelMode: google.maps.TravelMode.DRIVING // app limited only to driving
    }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}