// server.js
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Ensure downloads folder exists
const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

// Change this to your actual ffmpeg exe path
const ffmpegPath = "C:\\ffmpeg\\bin\\ffmpeg.exe"; // important: full path to ffmpeg.exe

app.post('/api/convert', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  const id = uuidv4();
  const outputFileTemplate = path.join(downloadDir, `${id}.%(ext)s`);
  const mp3Path = path.join(downloadDir, `${id}.mp3`);

  const command = `python -m yt_dlp --ffmpeg-location "${ffmpegPath}" -x --audio-format mp3 -o "${outputFileTemplate}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('yt-dlp error:', stderr);
      return res.status(500).json({ error: 'Conversion failed' });
    }

    // Ensure file exists
    if (!fs.existsSync(mp3Path)) {
      return res.status(500).json({ error: 'Converted file not found' });
    }

    // Get title and thumbnail
    const [title, thumbnail] = stdout.trim().split('|||');
    const downloadUrl = `http://localhost:${PORT}/downloads/${id}.mp3`;

    res.json({ downloadUrl, title, thumbnail });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
