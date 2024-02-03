// Author: Ryan Cronin
//
// Required modules for HTTP requests and file operations
const axios = require('axios');
const fs = require('fs');

// Bitly API credentials
const bitlyToken = ''; // Your Bitly access token
const groupGuid = ''; // Your Bitly group GUID

// Configured Axios instance for Bitly API requests
const bitlyAPI = axios.create({
    baseURL: 'https://api-ssl.bitly.com/v4/', // Bitly API base URL
    headers: { 'Authorization': `Bearer ${bitlyToken}` } // Authorization header
});

// Function to create a delay, useful for rate-limiting or pacing requests
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); // Returns a promise that resolves after a delay
}

// Retrieves all Bitlinks associated with a specific group
async function getBitlinksByGroup(groupGuid) {
    let allBitlinks = []; // Stores all retrieved Bitlinks
    let searchAfter = null; // Pagination control

    do {
        try {
            // Define request parameters
            const params = searchAfter ? { size: 50, search_after: searchAfter } : { size: 50 };
            const response = await bitlyAPI.get(`/groups/${groupGuid}/bitlinks`, { params });
            allBitlinks = allBitlinks.concat(response.data.links); // Collect Bitlinks
            searchAfter = response.data.pagination.search_after; // Update pagination cursor for next loop iteration

            await delay(250); // Introduce delay to avoid hitting rate limits
        } catch (error) {
            console.error('Error fetching bitlinks:', error); // Error handling
            return [];
        }
    } while (searchAfter); // Continue until all pages are retrieved

    console.log(`Fetched a total of ${allBitlinks.length} bitlinks`); // Log total Bitlinks retrieved
    return allBitlinks;
}

// Retrieves the total number of clicks for a Bitlink over its entire history
async function getBitlinkClicksSummary(bitlink) {
    try {
        const response = await bitlyAPI.get(`/bitlinks/${encodeURIComponent(bitlink)}/clicks/summary`, {
            params: { unit: 'day', units: -1 } // Retrieve total clicks, -1 retrieves without a specific timeframe
        });
        return response.data.total_clicks; // Return total clicks
    } catch (error) {
        console.error(`Error fetching click summary for ${bitlink}:`, error); // Error handling
        return 0;
    }
}

// Main function to guide retrieving Bitlinks and writing them to a CSV file
async function main() {
    const bitlinks = await getBitlinksByGroup(groupGuid); // Retrieve Bitlinks
    let fileContent = 'Creation Date, Bitlink, Name, Total Clicks\n'; // CSV header
	
	// Iterate through each Bitlink and compile CSV data
    for (const bitlink of bitlinks) {
        const totalClicks = await getBitlinkClicksSummary(bitlink.id); // Retrieve clicks summary for each Bitlink
		
        // Handle quotes in title for CSV format
        const bitlinkName = bitlink.title ? `"${bitlink.title.replace(/"/g, '""')}"` : 'No Name'; // Handle unnamed Bitlinks
        const creationDate = new Date(bitlink.created_at).toLocaleDateString(); // Format creation date

        // Append data to CSV content
        fileContent += `${creationDate}, ${bitlink.link}, ${bitlinkName}, ${totalClicks}\n`;
    }

    // Write CSV data to a file
    fs.writeFile('all-bitlinks.csv', fileContent, (err) => {
        if (err) {
            console.error('Error writing to file:', err); // Error handling
        } else {
            console.log('Saved all bitlinks with creation dates, names, and total click data to all-bitlinks.csv'); // Success message
        }
    });
}

main(); // Execute the main function :)
