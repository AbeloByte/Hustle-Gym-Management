const db = require('./db');

async function verifyTables() {
    const tablesTofind = [
        'admins', 'gym_settings', 'members', 'plans',
        'memberships', 'attendance', 'equipment',
        'maintenance_logs', 'audit_logs', 'daily_notes'
    ];

    console.log("--- Starting Database Verification ---");

    try {
        // Query to get all table names in the current database
        const res = await db.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        const existingTables = res.rows.map(t => t.table_name);

        let allFound = true;
        tablesTofind.forEach(table => {
            if (existingTables.includes(table)) {
                console.log(`✅ Table "${table}" exists.`);
            } else {
                console.log(`❌ Table "${table}" is MISSING!`);
                allFound = false;
            }
        });

        if (allFound) {
            console.log("\n✨ SUCCESS: All 10 tables are ready in PostgreSQL.");
        } else {
            console.log("\n⚠️ WARNING: Some tables are missing. Please re-run your SQL script.");
        }

    } catch (err) {
        console.error("❌ CONNECTION ERROR:", err.message);
        console.log("Check your .env file credentials.");
    } finally {
        process.exit();
    }
}

verifyTables();
