const axios = require('axios');
const fs = require('fs');

const bitlyToken = ''; // Replace with your actual access token

const bitlyAPI = axios.create({
    baseURL: 'https://api-ssl.bitly.com/v4/',
    headers: { 'Authorization': `Bearer ${bitlyToken}` }
});

async function getGroups() {
    try {
        const response = await bitlyAPI.get('/groups');
        return response.data.groups;
    } catch (error) {
        console.error('Error fetching groups:', error);
        return [];
    }
}

async function main() {
    const groups = await getGroups();
    
    // Write to a file
    fs.writeFile('mdln-groups.txt', JSON.stringify(groups, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Saved groups to mdln-groups.txt');
        }
    });
}

main();