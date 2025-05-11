const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/upload', (req, res) => {
  const { imageData } = req.body;
  console.log("Received drawing");
  res.json({ success: true, imageData });
});

module.exports = app;