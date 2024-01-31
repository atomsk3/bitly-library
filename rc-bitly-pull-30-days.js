const axios = require('axios');
const fs = require('fs');

const bitlyToken = ''; // Replace with your actual access token
const groupGuid = ''; // Replace with your actual group GUID

const bitlyAPI = axios.create({
    baseURL: 'https://api-ssl.bitly.com/v4/',
    headers: { 'Authorization': `Bearer ${bitlyToken}` }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBitlinksByGroup(groupGuid) {
    let allBitlinks = [];
    let searchAfter = null;

    do {
        try {
            const params = searchAfter ? { size: 50, search_after: searchAfter } : { size: 50 };
            const response = await bitlyAPI.get(`/groups/${groupGuid}/bitlinks`, { params });
            allBitlinks = allBitlinks.concat(response.data.links);
            searchAfter = response.data.pagination.search_after;

            await delay(250);
        } catch (error) {
            console.error('Error fetching bitlinks:', error);
            return [];
        }
    } while (searchAfter);

    console.log(`Fetched a total of ${allBitlinks.length} bitlinks`);
    return allBitlinks;
}

async function getBitlinkClicksSummary(bitlink) {
    try {
        const response = await bitlyAPI.get(`/bitlinks/${encodeURIComponent(bitlink)}/clicks/summary`, {
            params: {
                unit: 'day', 
                units: 30
            }
        });
        return response.data.total_clicks;
    } catch (error) {
        console.error(`Error fetching click summary for ${bitlink}:`, error);
        return 0;
    }
}

async function main() {
    const bitlinks = await getBitlinksByGroup(groupGuid);
    let fileContent = '';

    for (const bitlink of bitlinks) {
        const totalClicks = await getBitlinkClicksSummary(bitlink.id);
        const bitlinkName = bitlink.title || 'No Name';
        const creationDate = new Date(bitlink.created_at).toLocaleDateString();

        fileContent += `Creation Date: ${creationDate}, Bitlink: ${bitlink.link}, Name: ${bitlinkName}, Total Clicks Last 30 Days: ${totalClicks}\n`;
    }

    fs.writeFile('all-bitlinks-last-30-days-clicks.txt', fileContent, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Saved all bitlinks with creation dates, names, and click data for the last 30 days to all-bitlinks-last-30-days-clicks.txt');
        }
    });
}

main();