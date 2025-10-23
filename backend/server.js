const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database setup
const dbPath = path.join(__dirname, 'tenant_management.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Properties table
  db.run(`CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    imageUrl TEXT,
    capacity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add capacity column to existing properties table if it doesn't exist
  db.run(`ALTER TABLE properties ADD COLUMN capacity INTEGER DEFAULT 1`, (err) => {
    // Ignore error if column already exists
  });

  // Tenants table
  db.run(`CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    propertyId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    apartmentNumber TEXT NOT NULL,
    apartmentType TEXT,
    leaseStartDate TEXT NOT NULL,
    leaseEndDate TEXT NOT NULL,
    rentAmount REAL NOT NULL,
    paymentFrequency TEXT NOT NULL,
    profilePicture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propertyId) REFERENCES properties (id)
  )`);

  // Add apartmentType column to existing tenants table if it doesn't exist
  db.run(`ALTER TABLE tenants ADD COLUMN apartmentType TEXT`, (err) => {
    // Ignore error if column already exists
  });

  // Payments table
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    amount REAL NOT NULL,
    dueDate TEXT NOT NULL,
    paidDate TEXT,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants (id)
  )`);

  // Maintenance requests table
  db.run(`CREATE TABLE IF NOT EXISTS maintenance_requests (
    id TEXT PRIMARY KEY,
    propertyId TEXT NOT NULL,
    tenantId TEXT,
    apartmentNumber TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    photo TEXT,
    submittedDate TEXT NOT NULL,
    estimatedCompletion TEXT,
    completedDate TEXT,
    cost REAL DEFAULT 0,
    contractor TEXT,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propertyId) REFERENCES properties (id),
    FOREIGN KEY (tenantId) REFERENCES tenants (id)
  )`);

  // Add missing columns to existing maintenance_requests table
  db.run(`ALTER TABLE maintenance_requests ADD COLUMN propertyId TEXT`, (err) => {});
  db.run(`ALTER TABLE maintenance_requests ADD COLUMN category TEXT DEFAULT 'General'`, (err) => {});
  db.run(`ALTER TABLE maintenance_requests ADD COLUMN priority TEXT DEFAULT 'Medium'`, (err) => {});
  db.run(`ALTER TABLE maintenance_requests ADD COLUMN title TEXT DEFAULT 'Maintenance Request'`, (err) => {});
  db.run(`ALTER TABLE maintenance_requests ADD COLUMN estimatedCompletion TEXT`, (err) => {});
  db.run(`ALTER TABLE maintenance_requests ADD COLUMN completedDate TEXT`, (err) => {});
  db.run(`ALTER TABLE maintenance_requests ADD COLUMN cost REAL DEFAULT 0`, (err) => {});
  db.run(`ALTER TABLE maintenance_requests ADD COLUMN contractor TEXT`, (err) => {});

  // Fix the tenantId constraint - recreate table with proper schema
  db.run(`CREATE TABLE IF NOT EXISTS maintenance_requests_new (
    id TEXT PRIMARY KEY,
    propertyId TEXT NOT NULL,
    tenantId TEXT,
    apartmentNumber TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    priority TEXT NOT NULL DEFAULT 'Medium',
    title TEXT NOT NULL DEFAULT 'Maintenance Request',
    description TEXT NOT NULL,
    photo TEXT,
    submittedDate TEXT NOT NULL,
    estimatedCompletion TEXT,
    completedDate TEXT,
    cost REAL DEFAULT 0,
    contractor TEXT,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propertyId) REFERENCES properties (id),
    FOREIGN KEY (tenantId) REFERENCES tenants (id)
  )`, (err) => {
    if (!err) {
      // Copy data from old table if it exists
      db.run(`INSERT OR IGNORE INTO maintenance_requests_new SELECT 
        id, propertyId, tenantId, apartmentNumber, category, priority, title, description, 
        photo, submittedDate, estimatedCompletion, completedDate, cost, contractor, status, created_at 
        FROM maintenance_requests`, (copyErr) => {
          if (!copyErr) {
            // Drop old table and rename new one
            db.run(`DROP TABLE IF EXISTS maintenance_requests_old`, () => {
              db.run(`ALTER TABLE maintenance_requests RENAME TO maintenance_requests_old`, () => {
                db.run(`ALTER TABLE maintenance_requests_new RENAME TO maintenance_requests`, () => {
                  console.log('✅ Maintenance requests table schema updated');
                });
              });
            });
          }
        });
    }
  });

  // Announcements table
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    propertyId TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propertyId) REFERENCES properties (id)
  )`);
});

// Helper function to promisify database operations
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Tenant Management API Server',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      api: '/api',
      properties: '/api/properties',
      tenants: '/api/tenants',
      payments: '/api/payments',
      maintenance: '/api/maintenance-requests',
      announcements: '/api/announcements',
      health: '/api/health'
    }
  });
});

// API Routes

// Properties routes
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await dbAll('SELECT * FROM properties ORDER BY created_at DESC');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const { name, address, imageUrl, capacity } = req.body;
    const id = uuidv4();
    
    await dbRun(
      'INSERT INTO properties (id, name, address, imageUrl, capacity) VALUES (?, ?, ?, ?, ?)',
      [id, name, address, imageUrl || null, capacity || 1]
    );
    
    const property = await dbGet('SELECT * FROM properties WHERE id = ?', [id]);
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tenants routes
app.get('/api/tenants', async (req, res) => {
  try {
    const { propertyId } = req.query;
    let sql = 'SELECT * FROM tenants';
    let params = [];
    
    if (propertyId) {
      sql += ' WHERE propertyId = ?';
      params = [propertyId];
    }
    
    sql += ' ORDER BY created_at DESC';
    const tenants = await dbAll(sql, params);
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tenants', async (req, res) => {
  try {
    const { propertyId, name, email, phone, apartmentNumber, apartmentType, leaseStartDate, leaseEndDate, rentAmount, paymentFrequency, profilePicture } = req.body;
    const id = uuidv4();
    
    await dbRun(
      'INSERT INTO tenants (id, propertyId, name, email, phone, apartmentNumber, apartmentType, leaseStartDate, leaseEndDate, rentAmount, paymentFrequency, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, propertyId, name, email, phone, apartmentNumber, apartmentType || null, leaseStartDate, leaseEndDate, rentAmount, paymentFrequency, profilePicture || null]
    );
    
    // Create initial payment record
    const paymentId = uuidv4();
    await dbRun(
      'INSERT INTO payments (id, tenantId, amount, dueDate, status) VALUES (?, ?, ?, ?, ?)',
      [paymentId, id, rentAmount, leaseEndDate, 'Unpaid']
    );
    
    const tenant = await dbGet('SELECT * FROM tenants WHERE id = ?', [id]);
    res.status(201).json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    await dbRun(
      `UPDATE tenants SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    const tenant = await dbGet('SELECT * FROM tenants WHERE id = ?', [id]);
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payments routes
app.get('/api/payments', async (req, res) => {
  try {
    const { propertyId } = req.query;
    let sql = `
      SELECT p.*, t.propertyId 
      FROM payments p 
      JOIN tenants t ON p.tenantId = t.id
    `;
    let params = [];
    
    if (propertyId) {
      sql += ' WHERE t.propertyId = ?';
      params = [propertyId];
    }
    
    sql += ' ORDER BY p.dueDate DESC';
    const payments = await dbAll(sql, params);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/payments/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const paidDate = new Date().toISOString().split('T')[0];
    
    await dbRun(
      'UPDATE payments SET status = ?, paidDate = ? WHERE id = ?',
      ['Paid', paidDate, id]
    );
    
    const payment = await dbGet('SELECT * FROM payments WHERE id = ?', [id]);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Maintenance requests routes
app.get('/api/maintenance-requests', async (req, res) => {
  try {
    const { propertyId } = req.query;
    let sql = `
      SELECT mr.*, t.name as tenantName, t.email as tenantEmail
      FROM maintenance_requests mr 
      LEFT JOIN tenants t ON mr.tenantId = t.id
    `;
    let params = [];
    
    if (propertyId) {
      sql += ' WHERE mr.propertyId = ?';
      params = [propertyId];
    }
    
    sql += ' ORDER BY mr.submittedDate DESC';
    const requests = await dbAll(sql, params);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/maintenance-requests', async (req, res) => {
  try {
    const { 
      propertyId, 
      tenantId, 
      apartmentNumber, 
      category, 
      priority, 
      title, 
      description, 
      photo, 
      estimatedCompletion,
      contractor 
    } = req.body;
    const id = uuidv4();
    
    const submittedDate = new Date().toISOString().split('T')[0];
    
    await dbRun(
      `INSERT INTO maintenance_requests 
       (id, propertyId, tenantId, apartmentNumber, category, priority, title, description, photo, submittedDate, estimatedCompletion, contractor, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        propertyId, 
        tenantId || null, 
        apartmentNumber, 
        category || 'General', 
        priority || 'Medium', 
        title || 'Maintenance Request', 
        description, 
        photo || null, 
        submittedDate, 
        estimatedCompletion || null, 
        contractor || null, 
        'Open'
      ]
    );
    
    const request = await dbGet('SELECT * FROM maintenance_requests WHERE id = ?', [id]);
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/maintenance-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Handle completion date
    if (updates.status === 'Completed' && !updates.completedDate) {
      updates.completedDate = new Date().toISOString().split('T')[0];
    }
    
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    await dbRun(
      `UPDATE maintenance_requests SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    const request = await dbGet('SELECT * FROM maintenance_requests WHERE id = ?', [id]);
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Announcements routes
app.get('/api/announcements', async (req, res) => {
  try {
    const { propertyId } = req.query;
    let sql = 'SELECT * FROM announcements';
    let params = [];
    
    if (propertyId) {
      sql += ' WHERE propertyId = ?';
      params = [propertyId];
    }
    
    sql += ' ORDER BY date DESC';
    const announcements = await dbAll(sql, params);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { propertyId, title, content } = req.body;
    const id = uuidv4();
    const date = new Date().toISOString().split('T')[0];
    
    await dbRun(
      'INSERT INTO announcements (id, propertyId, title, content, date) VALUES (?, ?, ?, ?, ?)',
      [id, propertyId, title, content, date]
    );
    
    const announcement = await dbGet('SELECT * FROM announcements WHERE id = ?', [id]);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Base API route - provides information about available endpoints
app.get('/api', (req, res) => {
  res.json({
    message: 'Tenant Management API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      properties: '/api/properties',
      tenants: '/api/tenants',
      payments: '/api/payments',
      maintenance: '/api/maintenance-requests',
      announcements: '/api/announcements'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tenant Management API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed.');
    }
    process.exit(0);
  });
});