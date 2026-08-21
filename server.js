const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 1. Dashboard Stats ---
app.get('/api/stats', (req, res) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM survivors) AS totalSurvivors,
            (SELECT COUNT(*) FROM relief_camps) AS totalCamps,
            (SELECT COALESCE(SUM(quantity), 0) FROM camp_inventory WHERE category = 'Water') AS totalWater,
            (SELECT COUNT(*) FROM survivors WHERE vulnerability_status IN ('Critical', 'Pregnant', 'Infant')) AS criticalCases
    `;
    db.get(statsQuery, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// --- 2. Survivors Endpoints ---
app.get('/api/survivors', (req, res) => {
    const query = `
        SELECT s.*, c.camp_name, c.district 
        FROM survivors s
        JOIN relief_camps c ON s.camp_id = c.camp_id
        ORDER BY s.survivor_id DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/survivors', (req, res) => {
    const { camp_id, full_name, age, gender, origin_village, vulnerability_status, medical_need } = req.body;
    const query = `INSERT INTO survivors (camp_id, full_name, age, gender, origin_village, vulnerability_status, medical_need) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [camp_id, full_name, age, gender, origin_village, vulnerability_status, medical_need || 'None'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`UPDATE relief_camps SET current_occupancy = current_occupancy + 1 WHERE camp_id = ?`, [camp_id]);
        res.status(201).json({ survivor_id: this.lastID, message: 'Survivor registered successfully.' });
    });
});

// --- 3. Inventory Endpoints ---
app.get('/api/inventory', (req, res) => {
    const query = `
        SELECT i.*, c.camp_name 
        FROM camp_inventory i
        JOIN relief_camps c ON i.camp_id = c.camp_id
        ORDER BY i.inventory_id DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add or Restock Inventory
app.post('/api/inventory', (req, res) => {
    const { camp_id, item_name, category, quantity, unit } = req.body;
    const query = `INSERT INTO camp_inventory (camp_id, item_name, category, quantity, unit) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [camp_id, item_name, category, quantity, unit], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ inventory_id: this.lastID, message: 'Inventory item added.' });
    });
});

// Delete Inventory Item
app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM camp_inventory WHERE inventory_id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Inventory item deleted.' });
    });
});

// --- 4. Relief Camps Endpoints ---
app.get('/api/camps', (req, res) => {
    db.all(`SELECT * FROM relief_camps ORDER BY camp_id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add New Camp
app.post('/api/camps', (req, res) => {
    const { camp_name, district, capacity, contact_officer } = req.body;
    const query = `INSERT INTO relief_camps (camp_name, district, capacity, current_occupancy, contact_officer) VALUES (?, ?, ?, 0, ?)`;
    db.run(query, [camp_name, district, capacity, contact_officer], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ camp_id: this.lastID, message: 'Relief camp created.' });
    });
});

// Update Existing Camp
app.put('/api/camps/:id', (req, res) => {
    const { id } = req.params;
    const { camp_name, district, capacity, current_occupancy, contact_officer } = req.body;
    const query = `UPDATE relief_camps SET camp_name = ?, district = ?, capacity = ?, current_occupancy = ?, contact_officer = ? WHERE camp_id = ?`;
    db.run(query, [camp_name, district, capacity, current_occupancy, contact_officer, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Camp details updated.' });
    });
});

// Delete Camp
app.delete('/api/camps/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM relief_camps WHERE camp_id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Camp removed.' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});