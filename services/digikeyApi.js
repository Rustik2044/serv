const axios = require('axios');

let token = null;
let tokenExpiresAt = 0;

async function getToken() {
  const now = Date.now();
  if (token && now < tokenExpiresAt) return token;

  const res = await axios.post('https://api.digikey.com/v1/oauth2/token', null, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params: {
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    }
  });

  token = res.data.access_token;
  tokenExpiresAt = now + res.data.expires_in * 1000 - 5000;
  return token;
}

async function searchKeyword(Keywords, RecordCount = 5) {
  const token = await getToken();

  const res = await axios.post(
    'https://api.digikey.com/products/v4/search/keyword',
    { Keywords, RecordCount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-DIGIKEY-Client-Id': process.env.CLIENT_ID,
        'X-DIGIKEY-Locale-Site': 'US',
        'X-DIGIKEY-Locale-Language': 'en',
        'X-DIGIKEY-Locale-Currency': 'USD',
        'Content-Type': 'application/json'
      }
    }
  );

  return res.data;
}

async function lookupPart(ManufacturerPartNumber) {
  const token = await getToken();

  const res = await axios.post(
    'https://api.digikey.com/products/v4/productdetails',
    { ManufacturerPartNumber },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-DIGIKEY-Client-Id': process.env.CLIENT_ID,
        'X-DIGIKEY-Locale-Site': 'US',
        'X-DIGIKEY-Locale-Language': 'en',
        'X-DIGIKEY-Locale-Currency': 'USD',
        'Content-Type': 'application/json'
      }
    }
  );

  return { Product: res.data };
}

module.exports = { getToken, searchKeyword, lookupPart };
