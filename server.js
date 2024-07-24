const express = require('express');
const axios = require('axios');
const fs = require('fs');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const port = 3000;

const tokens = [
    { symbol: "xtz", id: "tezos" },
    { symbol: "atom", id: "cosmos" },
    { symbol: "iris", id: "iris-network" },
    { symbol: "lunc", id: "terra-luna" },
    { symbol: "icx", id: "icon" },
    { symbol: "kava", id: "kava" },
    { symbol: "ngm", id: "e-money" },
    { symbol: "sol", id: "solana" },
    { symbol: "ksm", id: "kusama" },
    { symbol: "fis", id: "stafi" },
    { symbol: "near", id: "near" },
    { symbol: "akt", id: "akash-network" },
    { symbol: "skl", id: "skale" },
    { symbol: "dot", id: "polkadot" },
    { symbol: "dvpn", id: "sentinel" },
    { symbol: "mina", id: "mina-protocol" },
    { symbol: "tick", id: "microtick" },
    { symbol: "regen", id: "regen" },
    { symbol: "matic", id: "matic-network" },
    { symbol: "xprt", id: "persistence" },
    { symbol: "dsm", id: "desmos" },
    { symbol: "cro", id: "crypto-com-chain" },
    { symbol: "bld", id: "agoric" },
    { symbol: "juno", id: "juno-network" },
    { symbol: "stars", id: "stargaze" },
    { symbol: "dock", id: "dock" },
    { symbol: "pdex", id: "polkadex" },
    { symbol: "kilt", id: "kilt-protocol" },
    { symbol: "cmdx", id: "comdex" },
    { symbol: "grav", id: "graviton" },
    { symbol: "steth", id: "staked-ether" },
    { symbol: "ux", id: "umee" },
    { symbol: "link", id: "chainlink" },
    { symbol: "cre", id: "crescent-network" },
    { symbol: "evmos", id: "evmos" },
    { symbol: "luna", id: "terra-luna-2" },
    { symbol: "axl", id: "axelar" },
    { symbol: "powr", id: "power-ledger" },
    { symbol: "ctk", id: "certik" },
    { symbol: "zil", id: "zilliqa" },
    { symbol: "razor", id: "razor-network" },
    { symbol: "apt", id: "aptos" },
    { symbol: "sdl", id: "stake-link" },
    { symbol: "qck", id: "quicksilver" },
    { symbol: "kyve", id: "kyve-network" },
    { symbol: "sui", id: "sui" },
    { symbol: "arch", id: "archway" },
    { symbol: "ntrn", id: "neutron-3" },
    { symbol: "strd", id: "stride" },
    { symbol: "sei", id: "sei-network" },
    { symbol: "tia", id: "celestia" },
    { symbol: "dym", id: "dymension" },
    { symbol: "zeta", id: "zetachain" },
    { symbol: "nibi", id: "nibiru" },
    { symbol: "saga", id: "saga-2" },
    { symbol: "flx", id: "flux-token" },
    { symbol: "bb", id: "bouncebit" },
    { symbol: "lava", id: "lava-network" },
    { symbol: "synt", id: "synternet-synt" },
    { symbol: "avail", id: "avail" },
    { symbol: "eth", id: "ethereum" },
    { symbol: "ftt", id: "ftx-token" },
    { symbol: "ada", id: "cardano" },
    { symbol: "celo", id: "celo" },
    { symbol: "band", id: "band-protocol" },
    { symbol: "avax", id: "avalanche-2" },
    { symbol: "infra", id: "bware-infra" },
    { symbol: "sd", id: "stader" },
    { symbol: "jto", id: "jito-governance-token" },
    { symbol: "ssv", id: "ssv-network" },
    { symbol: "jup", id: "jupiter-exchange-solana" },
    { symbol: "jlp", id: "jupiter-perpetuals-liquidity-provider-token" },
    { symbol: "bnb", id: "binancecoin" },
    { symbol: "cake", id: "pancakeswap-token" },
    { symbol: "bunny", id: "pancake-bunny" },
    { symbol: "rin", id: "aldrin" },
    { symbol: "mer", id: "mercurial" },
    { symbol: "auto", id: "auto" },
    { symbol: "btc", id: "bitcoin" },
    { symbol: "ustc", id: "terrausd" },
    { symbol: "eurc", id: "euro-coin" },
    { symbol: "usdt", id: "tether" }
];

async function fetchHistoricalData(token, date) {
    const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'x-cg-demo-api-key': 'CG-RcVb1FsNiEKkFbSnJztkf4XK' }
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
