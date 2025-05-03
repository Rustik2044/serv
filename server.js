require('dotenv').config();
const express = require('express');
const app = express();
const digikeyRoutes = require('./routes/digikey');

app.use(express.json());
app.use('/digikey', digikeyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Digi-Key API server running on port ${PORT}`);
});
