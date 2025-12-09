const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./military_assets.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");

    // Bases
    db.run(`CREATE TABLE IF NOT EXISTS bases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT
    )`);

    // Users
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        base_id INTEGER,
        FOREIGN KEY (base_id) REFERENCES bases (id)
    )`);

    // Assets Catalog (Types of assets)
    db.run(`CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL, 
        description TEXT
    )`);

    // Stocks (Current inventory per base) - Optional but fast for reads. 
    // However, user asks for calculated Net Movements. 
    // Let's keep a ledger (Transactions) as the source of truth, and maybe a view or just calculate on fly.
    // Actually, having a current stock table is useful for validation (can't transfer if you don't have it).

    // Transactions
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, -- 'PURCHASE', 'TRANSFER', 'ASSIGN', 'EXPEND'
        asset_id INTEGER NOT NULL,
        source_base_id INTEGER, -- Null for Purchase
        dest_base_id INTEGER,   -- Null for Expend/Assign (or assign to personnel handled differently)
        quantity INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        recipient_name TEXT, -- For Assignment
        FOREIGN KEY (asset_id) REFERENCES assets (id),
        FOREIGN KEY (source_base_id) REFERENCES bases (id),
        FOREIGN KEY (dest_base_id) REFERENCES bases (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Seed Data
    db.get("SELECT count(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            console.log("Seeding database...");
            const tx = db.prepare("INSERT INTO bases (name, location) VALUES (?, ?)");
            tx.run("Base Alpha", "Sector 7");
            tx.run("Base Bravo", "Sector 3");
            tx.run("HQ", "Capital City");
            tx.finalize();

            const assetTx = db.prepare("INSERT INTO assets (name, type, description) VALUES (?, ?, ?)");
            assetTx.run("M4 Carbine", "Weapon", "Standard issue assault rifle");
            assetTx.run("M1 Abrams", "Vehicle", "Main battle tank");
            assetTx.run("5.56mm Ammo Crate", "Ammunition", "Crate of 1000 rounds");
            assetTx.finalize();

            // Users
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync("password123", salt);

            const userTx = db.prepare("INSERT INTO users (username, password, role, base_id) VALUES (?, ?, ?, ?)");
            userTx.run("admin", hash, "admin", null);
            userTx.run("cmdr_alpha", hash, "base_commander", 1);
            userTx.run("log_alpha", hash, "logistics_officer", 1);
            userTx.run("cmdr_bravo", hash, "base_commander", 2);
            userTx.finalize();

            console.log("Seeding complete.");
        }
    });
});

module.exports = db;
