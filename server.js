// server.js — SastaKhojo v2.2 (No MongoDB needed!)
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const searchRoute = require('./routes/search');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/search', searchRoute);

app.get('/api/health', (req, res) => {
  const rapidKey = process.env.RAPIDAPI_KEY;
  const isLive   = rapidKey && !rapidKey.includes('your_');
  res.json({
    status:  'ok',
    version: '2.2',
    mode:    isLive ? 'LIVE (RapidAPI)' : 'DEMO (Built-in data)',
    db:      'In-Memory (no MongoDB needed)',
  });
});

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.listen(PORT, () => {
  console.log('');
  console.log('  SastaKhojo chal raha hai!');
  console.log('  Browser mein kholo: http://localhost:' + PORT);
  console.log('');
  const rapidKey = process.env.RAPIDAPI_KEY;
  if (rapidKey && !rapidKey.includes('your_')) {
    console.log('  MODE: LIVE — Real Amazon prices aayenge!');
  } else {
    console.log('  MODE: DEMO — Built-in sample data');
  }
  console.log('');
});
