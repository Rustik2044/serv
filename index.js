const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('qs'); // Добавлено для кодирования form-urlencoded
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

let cachedToken = null;
let tokenExpiresAt = 0;

console.log('DEBUG - CLIENT_ID:', process.env.CLIENT_ID);
console.log('DEBUG - CLIENT_SECRET:', process.env.CLIENT_SECRET ? 'defined' : 'undefined');

// Получение нового токена при необходимости
async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const client_id = process.env.CLIENT_ID;
  const client_secret = process.env.CLIENT_SECRET;

  const data = qs.stringify({
    grant_type: 'client_credentials',
    client_id,
    client_secret
  });

  const response = await axios.post('https://api.digikey.com/v1/oauth2/token', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  cachedToken = response.data.access_token;
  tokenExpiresAt = now + response.data.expires_in * 1000 - 5000; // буфер 5 сек
  return cachedToken;
}

// Ручной запрос токена
app.post('/token', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ access_token: token });
  } catch (error) {
    console.error('Ошибка при получении токена:', error.response?.data || error.message);
    res.status(500).json({ error: 'Token request failed', message: error.response?.data || error.message });
  }
});

// Поиск компонентов
app.post('/search', async (req, res) => {
  const { Keywords, RecordCount = 5 } = req.body;

  if (!Keywords) {
    return res.status(400).json({ error: 'Keywords is required' });
  }

  try {
    const token = await getAccessToken();

    const response = await axios.post(
      'https://api.digikey.com/products/v4/search/keyword',
      {
        Keywords,
        RecordCount
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-DIGIKEY-Client-Id': process.env.CLIENT_ID,
          'Content-Type': 'application/json',
          'X-DIGIKEY-Locale-Site': 'US',
          'X-DIGIKEY-Locale-Language': 'en',
          'X-DIGIKEY-Locale-Currency': 'USD'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при поиске:', error.response?.data || error.message);
    res.status(500).json({ error: 'Search request failed', message: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Прокси-сервер Digi-Key запущен: http://localhost:${PORT}`);
});
