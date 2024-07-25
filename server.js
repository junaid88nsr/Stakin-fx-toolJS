const express = require('express');
const axios = require('axios');
const fs = require('fs');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

const tokens = [
    { symbol: "xtz", id: "tezos" },
    { symbol: "atom", id: "cosmos" },
    // Add other tokens here
];

async function fetchHistoricalData(token, date) {
    const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
    };

    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${token.id}/history?date=${date}&localization=false`, options);
        return { symbol: token.symbol, id: token.id, price: response.data.market_data.current_price.usd };
    } catch (err) {
        console.error(`Error fetching data for ${token.symbol}: ${err}`);
        return { symbol: token.symbol, id: token.id, price: null };
    }
}

function saveToExcel(data) {
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Historical Rates');
    xlsx.writeFile(wb, 'historical_rates.xlsx');
}

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.post('/fetch-data', async (req, res) => {
    const date = req.body.date;
    const batchSize = 25;
    let allData = [];

    for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        const batchData = await Promise.all(batch.map(token => fetchHistoricalData(token, date)));
        allData = allData.concat(batchData);

        if (i + batchSize < tokens.length) {
            console.log(`Waiting for 1 minute to respect API rate limits...`);
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    }

    saveToExcel(allData);
    res.download('historical_rates.xlsx');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
