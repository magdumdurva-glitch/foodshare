import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'foodshare.db');

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('donor', 'ngo', 'admin')) NOT NULL,
      phone TEXT,
      organization TEXT,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      donor_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      food_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT DEFAULT 'meals',
      description TEXT,
      location TEXT NOT NULL,
      pickup_address TEXT NOT NULL,
      available_from DATETIME NOT NULL,
      available_until DATETIME NOT NULL,
      image_url TEXT,
      status TEXT CHECK(status IN ('available', 'claimed', 'picked_up', 'completed', 'cancelled')) DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY,
      donation_id TEXT UNIQUE NOT NULL,
      ngo_id TEXT NOT NULL,
      claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      pickup_time DATETIME,
      notes TEXT,
      status TEXT CHECK(status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
      FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
      FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      donation_id TEXT,
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDatabase();
}

function seedDatabase() {
  rotateLegacySeedPasswords();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const donationCount = db.prepare('SELECT COUNT(*) as count FROM donations').get().count;
  const logCount = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get().count;

  if (userCount > 0 && donationCount > 0 && logCount > 0) return;

  const seedPasswords = {
    donor1: process.env.SEED_DONOR_1_PASSWORD,
    donor2: process.env.SEED_DONOR_2_PASSWORD,
    ngo1: process.env.SEED_NGO_1_PASSWORD,
    ngo2: process.env.SEED_NGO_2_PASSWORD,
    admin: process.env.SEED_ADMIN_PASSWORD
  };

  if (Object.values(seedPasswords).some((password) => !password || password.length < 12)) {
    console.warn('Demo data seeding skipped. Configure all five SEED_*_PASSWORD values (12+ characters) to enable it.');
    return;
  }

  console.log('Seeding initial FoodShare demo data (with hashed passwords)...');

  const SALT_ROUNDS = 10;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, phone, organization, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  if (userCount === 0) {
    insertUser.run(
      'usr-donor-1',
      'Kartik Mahindrakar',
      'donor@foodshare.org',
      bcrypt.hashSync(seedPasswords.donor1, SALT_ROUNDS),
      'donor',
      '+91 98765 43210',
      'Green Campus Cafe',
      'Thane West, Maharashtra'
    );

    insertUser.run(
      'usr-donor-2',
      'APSIT Central Canteen',
      'canteen@foodshare.org',
      bcrypt.hashSync(seedPasswords.donor2, SALT_ROUNDS),
      'donor',
      '+91 98220 11223',
      'A.P. Shah Institute of Technology',
      'Kasarvadavali, Ghodbunder Rd, Thane'
    );

    insertUser.run(
      'usr-ngo-1',
      'Helping Hands Foundation',
      'ngo@foodshare.org',
      bcrypt.hashSync(seedPasswords.ngo1, SALT_ROUNDS),
      'ngo',
      '+91 91234 56789',
      'Helping Hands NGO',
      'Thane & Navi Mumbai'
    );

    insertUser.run(
      'usr-ngo-2',
      'Roti Bank Volunteers',
      'roti@foodshare.org',
      bcrypt.hashSync(seedPasswords.ngo2, SALT_ROUNDS),
      'ngo',
      '+91 99887 76655',
      'Roti Bank Youth Wing',
      'Mulund & Thane East'
    );

    insertUser.run(
      'usr-admin-1',
      'WMD Project Admin / Faculty',
      'admin@foodshare.org',
      bcrypt.hashSync(seedPasswords.admin, SALT_ROUNDS),
      'admin',
      '+91 90000 00001',
      'FoodShare Central Council',
      'Mumbai Metropolitan Region'
    );
  }

  // Seed Donations
  const now = new Date();
  const plusMinutes = (m) => new Date(now.getTime() + m * 60000).toISOString();
  const minusHours = (h) => new Date(now.getTime() - h * 3600000).toISOString();

  const insertDonation = db.prepare(`
    INSERT INTO donations (id, donor_id, food_name, food_type, quantity, unit, description, location, pickup_address, available_from, available_until, image_url, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Available - Expiring soon (Urgent 45 mins)
  insertDonation.run(
    'don-101',
    'usr-donor-1',
    'Fresh Vegetable Dum Biryani & Raita',
    'cooked',
    25,
    'meals',
    'Freshly prepared fragrant basmati vegetable biryani packed in foil boxes with mint raita. Prepared for college seminar lunch.',
    'Thane West',
    'Green Campus Cafe, Near Ghodbunder Road, Thane',
    minusHours(1),
    plusMinutes(45),
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    'available',
    minusHours(1)
  );

  // 2. Available - Normal (4 hours left)
  insertDonation.run(
    'don-102',
    'usr-donor-2',
    'Paneer Pulao & Dal Tadka Packs',
    'cooked',
    35,
    'meals',
    'Hygienically packed dinner containers containing steamed jeera pulao with shahi paneer and yellow dal.',
    'Kasarvadavali',
    'APSIT Student Canteen, Ghodbunder Rd, Kasarvadavali, Thane',
    minusHours(0.5),
    plusMinutes(240),
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    'available',
    minusHours(0.5)
  );

  // 3. Available - Bakery items (6 hours left)
  insertDonation.run(
    'don-103',
    'usr-donor-1',
    'Assorted Fresh Whole Wheat Bread & Buns',
    'bakery',
    50,
    'packets',
    'Freshly baked daily bread loaves and pav buns, sealed and in prime condition.',
    'Thane West',
    'Bakery Counter, Green Campus, Thane West',
    minusHours(2),
    plusMinutes(360),
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    'available',
    minusHours(2)
  );

  // 4. Claimed - In progress pickup
  insertDonation.run(
    'don-104',
    'usr-donor-2',
    'Idli Sambhar & Chutney Combo',
    'cooked',
    20,
    'meals',
    'Morning breakfast surplus idlis with hot sambhar and coconut chutney in insulated containers.',
    'Kasarvadavali',
    'APSIT Canteen Kitchen Gate #2',
    minusHours(3),
    plusMinutes(120),
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    'claimed',
    minusHours(3)
  );

  const insertClaim = db.prepare(`
    INSERT INTO claims (id, donation_id, ngo_id, claimed_at, pickup_time, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertClaim.run(
    'clm-201',
    'don-104',
    'usr-ngo-1',
    minusHours(1.5),
    plusMinutes(30),
    'Volunteer vehicle en route with insulated carrier crates.',
    'active'
  );

  // 5. Completed donation
  insertDonation.run(
    'don-105',
    'usr-donor-1',
    'Packed Mixed Fruit Boxes (Apples & Bananas)',
    'fruits_veg',
    40,
    'boxes',
    'Pre-portioned assorted fruit boxes distributed successfully to shelter homes.',
    'Thane West',
    'Main Reception, Thane West',
    minusHours(24),
    minusHours(18),
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80',
    'completed',
    minusHours(24)
  );

  insertClaim.run(
    'clm-202',
    'don-105',
    'usr-ngo-2',
    minusHours(22),
    minusHours(20),
    'Distributed to Mulund child shelter.',
    'completed'
  );

  // Insert initial logs
  const insertLog = db.prepare(`
    INSERT INTO activity_logs (id, donation_id, user_id, action, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLog.run('log-1', 'don-101', 'usr-donor-1', 'DONATION_CREATED', 'Kartik donated 25 meals of Dum Biryani', minusHours(1));
  insertLog.run('log-2', 'don-104', 'usr-ngo-1', 'DONATION_CLAIMED', 'Helping Hands Foundation claimed Idli Sambhar combo', minusHours(1.5));
  insertLog.run('log-3', 'don-105', 'usr-ngo-2', 'DONATION_COMPLETED', '40 fruit boxes collected and handed over', minusHours(18));

  console.log('Database seeded successfully with bcrypt-hashed passwords.');
}

function rotateLegacySeedPasswords() {
  const accounts = [
    { id: 'usr-donor-1', email: 'donor@foodshare.org', envName: 'SEED_DONOR_1_PASSWORD', legacyPassword: 'donor123' },
    { id: 'usr-donor-2', email: 'canteen@foodshare.org', envName: 'SEED_DONOR_2_PASSWORD', legacyPassword: 'canteen123' },
    { id: 'usr-ngo-1', email: 'ngo@foodshare.org', envName: 'SEED_NGO_1_PASSWORD', legacyPassword: 'ngo123' },
    { id: 'usr-ngo-2', email: 'roti@foodshare.org', envName: 'SEED_NGO_2_PASSWORD', legacyPassword: 'roti123' },
    { id: 'usr-admin-1', email: 'admin@foodshare.org', envName: 'SEED_ADMIN_PASSWORD', legacyPassword: 'admin123' }
  ];

  const getUser = db.prepare('SELECT email, password FROM users WHERE id = ?');
  const getUserByEmail = db.prepare('SELECT id FROM users WHERE email = ?');
  const updateEmail = db.prepare('UPDATE users SET email = ? WHERE id = ?');
  const updatePassword = db.prepare('UPDATE users SET password = ? WHERE id = ?');

  for (const account of accounts) {
    const user = getUser.get(account.id);
    if (!user) continue;

    const emailOwner = getUserByEmail.get(account.email);
    if (user.email !== account.email && (!emailOwner || emailOwner.id === account.id)) {
      updateEmail.run(account.email, account.id);
    }

    const configuredPassword = process.env[account.envName];
    const legacyPasswordMatches = user.password === account.legacyPassword ||
      (() => {
        try {
          return bcrypt.compareSync(account.legacyPassword, user.password);
        } catch {
          return false;
        }
      })();
    const replacementPassword = configuredPassword && configuredPassword.length >= 12
      ? configuredPassword
      : legacyPasswordMatches
        ? crypto.randomBytes(32).toString('hex')
        : null;

    if (replacementPassword) {
      updatePassword.run(bcrypt.hashSync(replacementPassword, 10), account.id);
    }
  }
}
