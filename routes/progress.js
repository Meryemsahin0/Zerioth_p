const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// 1. Token Doğrulama Middleware Fonksiyonu
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
};

// 2. Örnek İlerleme Rotaları (Buraya kendi projenizin rotalarını ekleyebilirsiniz)
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'İlerleme verileri başarıyla getirildi.' });
});

// 3. Router'ı dışarı aktarma (Server.js'in beklediği yapı)
module.exports = router;