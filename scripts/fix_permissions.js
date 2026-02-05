
import pg from 'pg';
const { Client } = pg;

const config = {
    user: 'postgres',
    password: 'Youknowwho1@@@',
    host: 'db.lxxbccuiwrvawzzffbxl.supabase.co',
    port: 5432,
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false
    }
};

const client = new Client(config);

const sql = `
-- FORCE FIX DELETE PERMISSIONS

-- 1. Fix Sales
ALTER TABLE active_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON active_sales;
CREATE POLICY "Allow All" ON active_sales FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE active_sales DISABLE ROW LEVEL SECURITY;

-- 2. Fix Coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON coupons;
CREATE POLICY "Allow All" ON coupons FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
`;

async function run() {
    try {
        console.log("Connecting to database...");
        await client.connect();
        console.log("Connected. Executing Permissions Fix...");
        await client.query(sql);
        console.log("SUCCESS: Permissions fixed! You can now delete sales/coupons.");
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        await client.end();
    }
}

run();
