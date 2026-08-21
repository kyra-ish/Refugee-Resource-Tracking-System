const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'relief_system.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite relief system database.');
    }
});

db.serialize(() => {
    // 1. Camps Table
    db.run(`CREATE TABLE IF NOT EXISTS relief_camps (
        camp_id INTEGER PRIMARY KEY AUTOINCREMENT,
        camp_name TEXT NOT NULL,
        district TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        current_occupancy INTEGER DEFAULT 0,
        contact_officer TEXT NOT NULL
    )`);

    // 2. Survivors Table
    db.run(`CREATE TABLE IF NOT EXISTS survivors (
        survivor_id INTEGER PRIMARY KEY AUTOINCREMENT,
        camp_id INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        origin_village TEXT NOT NULL,
        vulnerability_status TEXT DEFAULT 'Standard',
        medical_need TEXT DEFAULT 'None',
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (camp_id) REFERENCES relief_camps (camp_id)
    )`);

    // 3. Inventory Table
    db.run(`CREATE TABLE IF NOT EXISTS camp_inventory (
        inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
        camp_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit TEXT NOT NULL,
        FOREIGN KEY (camp_id) REFERENCES relief_camps (camp_id)
    )`);

    // Seed Data if camps table is empty
    db.get(`SELECT COUNT(*) as count FROM relief_camps`, (err, row) => {
        if (row && row.count === 0) {
            console.log('Seeding initial relief camps and inventory...');
            
            // Seed Camps
            const stmtCamp = db.prepare(`INSERT INTO relief_camps (camp_name, district, capacity, current_occupancy, contact_officer) VALUES (?, ?, ?, ?, ?)`);
            stmtCamp.run('Silchar Town High School Camp', 'Cachar', 500, 320, 'R. Debroy');
            stmtCamp.run('Dhubri Riverbank Relief Shelter', 'Dhubri', 800, 740, 'M. Hussain');
            stmtCamp.run('Kaliabor Community Relief Base', 'Nagaon', 400, 180, 'P. Bora');
            stmtCamp.finalize();

            // Seed Survivors
            const stmtSurv = db.prepare(`INSERT INTO survivors (camp_id, full_name, age, gender, origin_village, vulnerability_status, medical_need) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            stmtSurv.run(1, 'Anowar Ali', 42, 'Male', 'Sonabarighat', 'Standard', 'None');
            stmtSurv.run(1, 'Runu Das', 28, 'Female', 'Tarapur', 'Pregnant', 'Prenatal Checkup');
            stmtSurv.run(2, 'Bijoy Kalita', 71, 'Male', 'Bilasipara', 'Elderly', 'Hypertension medication');
            stmtSurv.run(2, 'Fatima Begum', 4, 'Female', 'Gauripur', 'Infant', 'ORS & Fever Syrup');
            stmtSurv.finalize();

            // Seed Inventory
            const stmtInv = db.prepare(`INSERT INTO camp_inventory (camp_id, item_name, category, quantity, unit) VALUES (?, ?, ?, ?, ?)`);
            stmtInv.run(1, 'Drinking Water', 'Water', 4500, 'Liters');
            stmtInv.run(1, 'Rice & Pulses', 'Food', 1200, 'kg');
            stmtInv.run(2, 'First Aid Kits', 'Medical', 85, 'Packs');
            stmtInv.run(2, 'Tarpaulin Sheets', 'Shelter', 50, 'Units');
            stmtInv.run(3, 'Drinking Water', 'Water', 6000, 'Liters');
            stmtInv.finalize();
        }
    });
});

module.exports = db;