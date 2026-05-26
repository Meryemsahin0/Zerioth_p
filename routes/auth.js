const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const db = require('../db');

const router = express.Router();

// Validation schema'ları
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().max(200)
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// Helper: Promise wrapper
const dbRun = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Kayıt
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, email, password, full_name } = value;

    // Kullanıcı var mı kontrol
    const existingUser = await dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      return res.status(409).json({ error: 'Kullanıcı adı veya email zaten kayıtlı' });
    }

    // Şifre hash
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // User ekle
    await dbRun(
      'INSERT INTO users (id, username, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, full_name || username]
    );

    // İlerleme kaydı oluştur
    await dbRun(
      'INSERT INTO user_progress (id, user_id, current_stage) VALUES (?, ?, ?)',
      [uuidv4(), userId, 1]
    );

    // JWT token oluştur
    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.status(201).json({
      message: '✓ Kayıt başarılı',
      token,
      user: { userId, username, email, full_name }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Kayıt işleminde hata' });
  }
});

// Giriş
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, password } = value;

    // Kullanıcı bul
    const user = await dbGet(
      'SELECT id, username, email, password_hash, full_name FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya parola' });
    }

    // Şifre kontrol
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya parola' });
    }

    // İlerleme getir
    const progress = await dbGet(
      'SELECT current_stage, completed_stages, total_points FROM user_progress WHERE user_id = ?',
      [user.id]
    );

    // Token oluştur
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({
      message: '✓ Giriş başarılı',
      token,
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name
      },
      progress: progress || {
        current_stage: 1,
        completed_stages: [],
        total_points: 0
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Giriş işleminde hata' });
  }
});

// Guest token (kayıt gerektirmez)
router.post('/guest-token', (req, res) => {
  const username = (req.body && req.body.username) || 'misafir';
  const guestId = 'guest_' + uuidv4();
  const token = jwt.sign(
    { userId: guestId, username, isGuest: true },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, userId: guestId, username });
});

// Token doğrula
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

module.exports = router;