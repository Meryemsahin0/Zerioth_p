const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. CORS AYARI: Hem yerelde hem Render üzerinde güvenli erişim sağlar
app.use(cors({
  origin: ["http://localhost:5000", "https://phishing-sumilator-zerioth.onrender.com"],
  credentials: true
}));

app.use(express.json());

// 2. STATİK DOSYA YÖNLENDİRMESİ: index.html ve diğer dosyaları sunucu üzerinden besler
app.use(express.static(__dirname));

// Ana sayfaya girildiğinde direkt oyunu açar
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. FLAG KONTROL ENDPOINT'İ (MIDDLEWARE)
app.use((req, res, next) => {
  if (req.path === '/api/flags/check' && req.method === 'POST') {
    const CORRECT_FLAGS = {
      1: 'mu{typosquatting_engellendi}',
      2: 'mu{credential_harvesting_tespit}',
      3: 'mu{zararli_makro_vba_analiz}',
      4: 'mu{aitm_session_hijack_tespit}',
      5: 'mu{quishing_bitirildi}'
    };

    const { stage_number, flag_text } = req.body;

    if (!stage_number || !flag_text) {
      return res.status(400).json({ error: 'Eksik veri gönderildi.' });
    }

    const normalizedSubmission = flag_text
      .trim()
      .replace(/I/g, 'i')
      .replace(/İ/g, 'i')
      .toLowerCase();

    if (normalizedSubmission === CORRECT_FLAGS[stage_number]) {
      return res.json({ correct: true, message: '✓ Harika!' });
    } else {
      return res.json({ correct: false, message: '✗ Yanlış Tehdit Vektörü!' });
    }
  }
  next();
});

// 4. DİNAMİK PORT AYARI: Render'ın atayacağı portu yakalar, yoksa 5000'i kullanır
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[+] Mu Kıtası Laboratuvarı Sunucusu port ${PORT} üzerinde aktif!`);
});