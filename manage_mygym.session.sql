CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    cost DECIMAL(10, 2)
);
