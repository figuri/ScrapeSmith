const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const cron = require('node-cron');

async function fetchData(url) {
    const response = await axios(url);
    console.log(response.data);
    return response.data;
}

async function scrapeCryptocurrencyPrices() {
    const url = 'https://finance.yahoo.com/crypto/';
    const html = await fetchData(url);
    const $ = cheerio.load(html);
    const prices = {};

    $('.data-col1 span').each((_, element) => {
        const currency = $(element).text().trim();
        const price = $(element).next('.data-col2').text().trim();
        prices[currency] = price;
    });

    return prices;
}

async function saveToOutputFile(data) {
    const timestamp = new Date().toISOString();
    const outputData = {
        timestamp,
        prices: data,
    };

    fs.writeFileSync('output.json', JSON.stringify(outputData, null, 2));
    console.log('Data saved to output.json');
}

// Run the scraper every day at midnight
// cron.schedule('0 0 * * *', async () => {
//     try {
//         const cryptocurrencyPrices = await scrapeCryptocurrencyPrices();
//         await saveToOutputFile(cryptocurrencyPrices);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// });

cron.schedule('* * * * *', async () => {
    try {
      const cryptocurrencyPrices = await scrapeCryptocurrencyPrices();
      await saveToOutputFile(cryptocurrencyPrices);
    } catch (error) {
      console.error('Error:', error);
    }
  });