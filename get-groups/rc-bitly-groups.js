// Author: Ryan Cronin
//
// Required modules
const axios = require('axios'); // Axios for HTTP requests
const fs = require('fs');       // File system module for file operations

// Bitly API credentials
const bitlyToken = ''; // Your Bitly access token

// Configuring Axios for Bitly API requests
const bitlyAPI = axios.create({
    baseURL: 'https://api-ssl.bitly.com/v4/', // Base URL for Bitly API
    headers: { 'Authorization': `Bearer ${bitlyToken}` } // Authorization header with Bearer token
});

// Function to retrieve groups from Bitly
async function getGroups() {
    try {
        const response = await bitlyAPI.get('/groups'); // Asynchronously fetch groups
        return response.data.groups;                   // Return groups data
    } catch (error) {
        console.error('Error fetching groups:', error); // Log any errors encountered
        return [];                                     // Return an empty array in case of error
    }
}

// Main function to guide operations
async function main() {
    const groups = await getGroups(); // Await the groups data from getGroups function
    
    // Writing groups data to a file
    fs.writeFile('mdln-groups.txt', JSON.stringify(groups, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err); // Log file writing errors
        } else {
            console.log('Saved groups to mdln-groups.txt'); // Confirmation log on successful write
        }
    });
}

main(); // Execute the main function :)
