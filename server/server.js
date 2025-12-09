const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "military_super_secret_key";

app.use(cors());
app.use(bodyParser.json());

// Middleware for authentication
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Auth Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return res.status(500).send("Server error");
        if (!user) return res.status(401).send("User not found");

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).send("Invalid password");

        const token = jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role,
            base_id: user.base_id
        }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, username: user.username, role: user.role, base_id: user.base_id } });
    });
});

app.get('/api/bases', authenticateJWT, (req, res) => {
    db.all("SELECT * FROM bases", (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

app.get('/api/assets', authenticateJWT, (req, res) => {
    db.all("SELECT * FROM assets", (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// Dashboard Metrics
app.get('/api/dashboard', authenticateJWT, (req, res) => {
    // Filters: base_id (optional, mandatory for base_commander), start_date, end_date, equipment_type
    const { base_id, start_date, end_date, equipment_type } = req.query;

    // RBAC Enforcement
    let queryBaseId = base_id;
    if (req.user.role === 'base_commander' || req.user.role === 'logistics_officer') {
        queryBaseId = req.user.base_id;
    }

    // Build query for transactions
    let sql = `SELECT t.*, a.name as asset_name, a.type as asset_type 
               FROM transactions t 
               JOIN assets a ON t.asset_id = a.id 
               WHERE 1=1`;
    const params = [];

    if (queryBaseId) {
        sql += ` AND (t.source_base_id = ? OR t.dest_base_id = ?)`;
        params.push(queryBaseId, queryBaseId);
    }
    if (equipment_type) {
        sql += ` AND a.type = ?`;
        params.push(equipment_type);
    }
    // We fetch all needed data and aggregate in JS for simplicity, or complex SQL. JS is easier for "Opening/Closing".

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).send(err.message);

        // Filter by date for "Period" metrics, but need full history for Opening Balance.
        const start = start_date ? new Date(start_date) : new Date(0); // Default beginning of time
        const end = end_date ? new Date(end_date) : new Date();

        let openingBalance = 0;
        let purchases = 0;
        let transferIn = 0;
        let transferOut = 0;
        let expended = 0;
        let assigned = 0;

        rows.forEach(row => {
            const txDate = new Date(row.timestamp);
            const isBeforeStart = txDate < start;
            const isInRange = txDate >= start && txDate <= end;

            // Helper to decide if transaction adds or removes from THIS base
            let impact = 0; // +1, -1, or 0
            let type = row.type;

            // Logic for "This Base" context. 
            // If queryBaseId is null (Admin viewing all), "Opening Balance" is global stock?
            // If Admin views all, Transfers cancel out (Net 0) unless one side is outside system? (Not possible here).
            // Let's assume if Admin views all, we sum up global inventory.

            const isDest = (!queryBaseId) || (row.dest_base_id == queryBaseId);
            const isSource = (!queryBaseId) || (row.source_base_id == queryBaseId);

            if (type === 'PURCHASE') {
                if (isDest) { // Purchase comes INTO dest
                    if (isBeforeStart) openingBalance += row.quantity;
                    if (isInRange) purchases += row.quantity;
                }
            } else if (type === 'TRANSFER') {
                if (isDest && !isSource) { // Incoming
                    if (isBeforeStart) openingBalance += row.quantity;
                    if (isInRange) transferIn += row.quantity;
                } else if (isSource && !isDest) { // Outgoing
                    if (isBeforeStart) openingBalance -= row.quantity;
                    if (isInRange) transferOut += row.quantity;
                }
            } else if (type === 'ASSIGN') {
                // Assign stays in stock but is marked assigned? 
                // Requirement: "Assigned" count.
                // If we assume Assignment REDUCES Available Balance count? 
                // Let's assume Balance includes Assigned.
                if (isSource) {
                    if (isInRange) assigned += row.quantity;
                }
            } else if (type === 'EXPEND') {
                // Expend removes from stock
                if (isSource) {
                    if (isBeforeStart) openingBalance -= row.quantity;
                    if (isInRange) expended += row.quantity;
                }
            }
        });

        const netMovement = purchases + transferIn - transferOut - expended; // Expended reduces balance?
        // Prompt says: "Net Movement (Purchases + Transfer In - Transfer Out)". It does NOT mention expended.
        // But Closing Balance must account for it?
        // Closing Balance = Opening + NetMovement (by definition of prompt) - Expended (logic).
        // Let's stick to prompt literal for Net Movement.

        const promptNetMovement = purchases + transferIn - transferOut;
        const closingBalance = openingBalance + promptNetMovement - expended;

        res.json({
            openingBalance,
            closingBalance,
            netMovement: promptNetMovement,
            details: {
                purchases,
                transferIn,
                transferOut,
                expended,
                assigned
            }
        });
    });
});

app.post('/api/transactions', authenticateJWT, (req, res) => {
    const { type, asset_id, source_base_id, dest_base_id, quantity, recipient_name } = req.body;
    // Basic Validation
    if (!type || !asset_id || !quantity) return res.status(400).send("Missing fields");

    // RBAC check
    if (req.user.role !== 'admin' && req.user.role !== 'base_commander' && req.user.role !== 'logistics_officer') {
        return res.status(403).send("Unauthorized");
    }

    // Add logic to restrict Log Officer to only their base? 
    // "Logistics Officer: Limited access to purchases and transfers."
    if (req.user.role === 'logistics_officer' || req.user.role === 'base_commander') {
        // Can only touch their own base
        const userBase = req.user.base_id;
        if (dest_base_id && dest_base_id != userBase && type === 'PURCHASE') return res.status(403).send("Can only purchase for your base");
        if (source_base_id && source_base_id != userBase && type === 'TRANSFER') return res.status(403).send("Can only transfer from your base");
    }

    const stmt = db.prepare(`INSERT INTO transactions (type, asset_id, source_base_id, dest_base_id, quantity, user_id, recipient_name) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(type, asset_id, source_base_id, dest_base_id, quantity, req.user.id, recipient_name, function (err) {
        if (err) return res.status(500).send(err.message);
        res.json({ id: this.lastID });
    });
    stmt.finalize();
});

app.get('/api/transactions', authenticateJWT, (req, res) => {
    // List history. Support filters.
    let sql = `SELECT t.*, a.name as asset_name, u.username, 
               sb.name as source_base, db.name as dest_base
               FROM transactions t
               LEFT JOIN assets a ON t.asset_id = a.id
               LEFT JOIN users u ON t.user_id = u.id
               LEFT JOIN bases sb ON t.source_base_id = sb.id
               LEFT JOIN bases db ON t.dest_base_id = db.id
               WHERE 1=1`;

    // Filter by base if not admin
    if (req.user.role !== 'admin') {
        sql += ` AND (t.source_base_id = ${req.user.base_id} OR t.dest_base_id = ${req.user.base_id})`;
    }

    sql += " ORDER BY t.timestamp DESC";

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
