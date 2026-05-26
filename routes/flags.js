const express = require('express');
const router = express.Router();

// Flag'ler sadece burada duruyor. Kullanıcı kaynak kodda göremez!
const CORRECT_FLAGS = {
  1: 'mu{typosquatting_engellendi}',
  2: 'mu{credential_harvesting_tespit}',
  3: 'mu{zararli_makro_vba_analiz}',
  4: 'mu{aitm_session_hijack_tespit}',
  5: 'mu{quishing_bitirildi}'
};

router.post('/check', async (req, res) => {
  try {
    const { stage_number, flag_text } = req.body;

    if (!stage_number || !flag_text) {
      return res.status(400).json({ error: 'Eksik veri gönderildi.' });
    }

    // Türkçe karakterlerin küçülürken bozulmasını engelleyen backend normalizasyonu
    const normalizedSubmission = flag_text
      .trim()
      .replace(/I/g, 'i')
      .replace(/İ/g, 'i')
      .toLowerCase();

    const isCorrect = normalizedSubmission === CORRECT_FLAGS[stage_number];

    if (isCorrect) {
      return res.json({
        correct: true,
        message: '✓ Harika! Tehdit vektörü başarıyla pasifize edildi.'
      });
    } else {
      return res.json({
        correct: false,
        message: '✗ Yanlış Tehdit Vektörü! Kod analizini tekrar yap.'
      });
    }

  } catch (err) {
    console.error('Sunucu hatası:', err);
    res.status(500).json({ error: 'Sunucu içi bir hata oluştu.' });
  }
});

module.exports = router;