const express = require('express');
const app = express();
const PORT = 5000;

// Notice: NO cors, NO dotenv, NO db connection, NO bcrypt

// We only include the middleware to parse the JSON body
app.use(express.json());

app.post('/api/auth/register', (req, res) => {
    // If the request gets here, it will print to the console
    console.log('--- MINIMAL SERVER: Request received successfully! ---');
    console.log('Request Body:', req.body);
    
    // It will then send a success response
    res.status(200).json({ message: "Success from the minimal test server!" });
});

app.listen(PORT, () => {
    console.log(`Minimal test server is running on port ${PORT}`);
    console.log('Waiting for a POST request to http://localhost:5000/api/auth/register');
});