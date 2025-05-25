// /Users/ctk/Programming/VSCodeProjects/carsontkempf.github.io/error-logger-server.js
const express = require('express');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing

const app = express();
const port = 3001; // Different from Jekyll's default 4000

// Middleware
app.use(cors()); // Allow requests from your Jekyll site (e.g., http://127.0.0.1:4000)
app.use(express.json()); // To parse JSON request bodies

// Endpoint to receive client-side errors
app.post('/log-client-error', (req, res) => {
    console.error('\n--- Client-Side Error Received ---');
    console.error('Timestamp:', req.body.timestamp || new Date().toISOString());
    console.error('URL:', req.body.url || 'N/A');
    console.error('User Agent:', req.body.userAgent || 'N/A');
    
    const errorData = req.body.error;
    if (errorData) {
        if (typeof errorData === 'object' && errorData !== null) {
            console.error('Error Message:', errorData.message || 'No message');
            if (errorData.name) console.error('Error Name:', errorData.name);
            if (errorData.stack) {
                console.error('Error Stack:\n', errorData.stack);
            } else {
                console.error('Error Details:', JSON.stringify(errorData, null, 2));
            }
        } else {
            console.error('Error:', errorData);
        }
    } else {
        console.error('Received error payload was empty or malformed:', req.body);
    }
    console.error('--- End Client-Side Error ---\n');
    
    res.status(200).send({ message: 'Error logged successfully' });
});

app.listen(port, () => {
    console.log(`Error logging server listening on http://localhost:${port}`);
    console.log('Client-side errors will be posted here from auth.js');
});
