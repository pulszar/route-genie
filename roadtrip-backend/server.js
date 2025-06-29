// import packages

import express from 'express';
import cors from 'cors'; // allows requests from frontend
import bodyParser from 'body-parser'; // converts JSON to JS objects
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();


// initalize the app

const app = express(); // server
const port = 4000; // server listens on 4000

// middleware, stuff that sits in between request from client and route handler

app.use(cors()); // allows frontend thats probably on a different port talk to backend
app.use(bodyParser.json()); // parses raw body into json

// openai stuff

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


app.post('/generate-roadtrip', async (req, res) => {
    const userPrompt = req.body.prompt;
    
    try {
        const response = await openai.responses.create({
            model: "gpt-4o",
            messages: `Your input will consist of a user describing what their ideal road trip looks like. Your job is to produce a list of
                    consisting of locations. The locations will consist of an origin, waypoints, and a destination. As a result, the
                    a road trip would start at the origin, continue from top to bottom of the waypoints, then end at the destination.
                    Be as efficient as possible creating this list.
                    
                    Obey the user if they ask for a certain amount of waypoints or specific locations. Otherwise, use your own judgment
                    to generate an appropriate amount of waypoints to match the user's needs.
                    
                    The program currently only supports driving as its mode of transportation, so don't create a route that requires
                    other forms of transportation such as going from the mainland to an island (ex. India -> Maldives). The exception to this is ferries.
                    
                    You will only produce the specific locations and respective country/subdivision.

                    Provide a description as to why it fits the user's description in another key value named "outputDescription". This description
                    shouldn't specify a route because what you pass to the google maps API might optimize it to find the faster route. You can
                    include the origin and destination as these are garunteed to be in the correct order.
                    
                    Your output will be in a parsable JSON format. It will be in the following format:
                    
                    {
                    "origin": "New York, NY",
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

                    ],
                    "destination": "Los Angeles, CA",
                    "outputDescription": "blah blah"
                    }
                    
                    I've been getting errors because you output a json starting and ending with backquotes and you also say 'json' before the json file.
                    make sure the output is formatted like the example.`,
            input: userPrompt
        });

        console.log(response)
        // res.json(completion)

    } catch (err) {
        console.error("Error in /generate-roadtrip: ", err.message);
        res.status(500).json({ error: "Something went wrong in the server" });
    }


});

//             method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer APIKEY`
//         },
//         body: JSON.stringify({
//             model: "gpt-4o-mini",
//             messages: [
//                 { role: "system", content: `

//                 Your input will consist of a user describing what their ideal road trip looks like. Your job is to produce a list of
//                 consisting of locations. The locations will consist of an origin, waypoints, and a destination. As a result, the
//                 a road trip would start at the origin, continue from top to bottom of the waypoints, then end at the destination.
//                 Be as efficient as possible creating this list.
                
//                 Obey the user if they ask for a certain amount of waypoints or specific locations. Otherwise, use your own judgment
//                 to generate an appropriate amount of waypoints to match the user's needs.
                
//                 The program currently only supports driving as its mode of transportation, so don't create a route that requires
//                 other forms of transportation such as going from the mainland to an island (ex. India -> Maldives). The exception to this is ferries.
                
//                 You will only produce the specific locations and respective country/subdivision.

//                 Provide a description as to why it fits the user's description in another key value named "outputDescription". This description
//                 shouldn't specify a route because what you pass to the google maps API might optimize it to find the faster route. You can
//                 include the origin and destination as these are garunteed to be in the correct order.
                
//                 Your output will be in a parsable JSON format. It will be in the following format:
                
//                 {
//                 "origin": "New York, NY",
//                 "waypoints":
//                 [
//                     {
//                     "location": "Chicago, IL",
//                     "stopover": true
//                     },
//                     {
//                     "location": "Denver, CO",
//                     "stopover": true
//                     }

//                 ],
//                 "destination": "Los Angeles, CA",
//                 "outputDescription": "blah blah"
//                 }
                
//                 I've been getting errors because you output a json starting and ending with backquotes and you also say 'json' before the json file.
//                 make sure the output is formatted like the example.

//                 `},
//                 { role: "user", content: description }
//                 ],
//             max_tokens: 250
//         })
//     });

//     console.log("API response status:", response.status);

//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("Response received from OpenAI:", data);

//     if (data.choices && data.choices.length > 0) {
//         const responseText = data.choices[0].message.content;
//         console.log("OpenAI response text:", responseText);

//         routeData = JSON.parse(responseText); // JSON data stored to global variable

//         const responseElement = document.getElementById('response');
//         if (responseElement) {
//             responseElement.innerText = JSON.stringify(routeData, null, 2);
//         } else {
//             console.error("Element not found");
//         }

//         calculateAndDisplayRoute();

//     } else {
//         console.log("No choices returned in the response");
//     }

// } catch (error) {
//     console.error("Error fetching", error);

//     const responseElement = document.getElementById('response');
//     if (responseElement) {
//         responseElement.innerText = 'An error occurred: ' + error.message;
//     } else {
//         console.error("Element not found");
//     }

// })





// app.get('/', (req, res) => { // req is request obj, res is response obj. client sends -> server sends back
//     res.send('Backend is running!'); // send this if we land on '/'
// });

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
