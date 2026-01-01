-- 1. ADMINS (For owner login)
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. GYM SETTINGS (For ID card branding)
CREATE TABLE gym_settings (
    id SERIAL PRIMARY KEY,
    gym_name VARCHAR(100) NOT NULL,
    logo_url TEXT,
    address TEXT,
    contact_number VARCHAR(20)
);


-- 3. MEMBERS (Core profile data)
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    member_code VARCHAR(50) UNIQUE NOT NULL, -- The string for the QR code
    photo_url TEXT,
    gender VARCHAR(10),
    emergency_contact VARCHAR(20),
    joined_date DATE DEFAULT CURRENT_DATE
);

-- 4. PLANS (Subscription templates)
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL,
    duration_days INTEGER NOT NULL, -- e.g. 30
    price DECIMAL(10, 2)
);

-- 5. MEMBERSHIPS (The active 'contract')
CREATE TABLE memberships (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES plans(id),
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, expired, frozen
    payment_note TEXT
);

-- 6. ATTENDANCE (USB Scanner logs)
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_method VARCHAR(20) DEFAULT 'QR_SCAN', -- QR_SCAN or MANUAL
    notes TEXT -- e.g. "Manual entry due to power outage"
);

-- 7. EQUIPMENT (Gym Materials)
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- e.g. Cardio, Weights
    quantity INTEGER DEFAULT 1,
    purchase_date DATE,
    status VARCHAR(20) DEFAULT 'working' -- working, needs_repair, broken
);

-- 8. MAINTENANCE_LOGS (Equipment history)
CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    cost DECIMAL(10, 2)
);

-- 9. AUDIT_LOGS (Security tracking)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    action VARCHAR(100), -- e.g. "Updated Expiry Date"
    member_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. DAILY_NOTES (The 'No Light' Diary)
CREATE TABLE daily_notes (
    id SERIAL PRIMARY KEY,
    note_date DATE DEFAULT CURRENT_DATE,
    content TEXT
);
