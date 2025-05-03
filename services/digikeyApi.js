const axios = require('axios');

let token = null;
let tokenExpiresAt = 0;

async function getToken() {
  const now = Date.now();
  if (token && now < tokenExpiresAt) return token;

  try {
    const res = await axios.post(
      'https://api.digikey.com/v1/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    token = res.data.access_token;
    tokenExpiresAt = now + res.data.expires_in * 1000 - 5000;
    return token;
  } catch (error) {
    console.error('Digi-Key token error:', error.response?.data || error.message);
    throw error;
  }
}

async function searchKeyword(Keywords, RecordCount = 5) {
  const token = await getToken();

  try {
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
  } catch (error) {
    console.error('Digi-Key search error:', error.response?.data || error.message);
    throw error;
  }
}

async function lookupPart(ManufacturerPartNumber) {
  const token = await getToken();

  try {
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
  } catch (error) {
    console.error('Digi-Key lookup error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getToken, searchKeyword, lookupPart };
