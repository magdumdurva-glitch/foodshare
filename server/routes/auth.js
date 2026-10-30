import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, organization, location } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  if (!['donor', 'ngo'].includes(role)) {
    return res.status(400).json({ error: 'Public registration is limited to donor and ngo accounts' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const id = `usr-${crypto.randomUUID()}`;
  const normalizedEmail = email.toLowerCase().trim();
  const hashedPassword = await bcrypt.hash(password, 10);

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, phone, organization, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    name.trim(),
    normalizedEmail,
    hashedPassword,
    role,
    phone || '',
    organization || (role === 'donor' ? 'Individual Donor' : 'Community Volunteer'),
    location || 'Thane, Maharashtra'
  );

  const newUser = db.prepare('SELECT id, name, email, role, phone, organization, location FROM users WHERE id = ?').get(id);
  const token = signToken(newUser);

  res.status(201).json({
    message: 'User registered successfully',
    user: newUser,
    token
  });
});

// POST /api/auth/users - Admin-only account creation
router.post('/users', authMiddleware, requireRole('admin'), async (req, res) => {
  const { name, email, password, role, phone, organization, location } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  if (!['donor', 'ngo', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be donor, ngo, or admin' });
  }

  if (password.length < 12) {
    return res.status(400).json({ error: 'Admin-created account passwords must be at least 12 characters' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const id = `usr-${crypto.randomUUID()}`;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, phone, organization, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    name.trim(),
    normalizedEmail,
    hashedPassword,
    role,
    phone || '',
    organization || (role === 'donor' ? 'Individual Donor' : 'Community Volunteer'),
    location || 'Thane, Maharashtra'
  );

  const user = db.prepare('SELECT id, name, email, role, phone, organization, location FROM users WHERE id = ?').get(id);
  res.status(201).json({ message: 'Account created successfully', user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare(`
    SELECT id, name, email, password, role, phone, organization, location 
    FROM users 
    WHERE email = ?
  `).get(email.toLowerCase().trim());

  if (!user) {
    // Return same error message to prevent email enumeration
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    organization: user.organization,
    location: user.location
  };

  const token = signToken(safeUser);
  res.json({
    message: 'Login successful',
    user: safeUser,
    token
  });
});

// GET /api/auth/me  — requires valid JWT
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare(`
    SELECT id, name, email, role, phone, organization, location, created_at 
    FROM users 
    WHERE id = ?
  `).get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

export default router;
