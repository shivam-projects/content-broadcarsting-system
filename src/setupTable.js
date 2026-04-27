const { pool } = require('./config/db');

const createTables = async () => {
  const client = await pool.connect();
  try {

    await client.query("BEGIN");

    const createTablesQuery = `
    
-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('TEACHER', 'PRINCIPAL')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONTENT TABLE
CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    file_size INT,
    uploaded_by INT REFERENCES users(id) ON DELETE CASCADE,

    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,

    approved_by INT REFERENCES users(id),
    approved_at TIMESTAMP,

    start_time TIMESTAMP,
    end_time TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONTENT SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS content_schedule (
    id SERIAL PRIMARY KEY,
    content_id INT REFERENCES content(id) ON DELETE CASCADE,
    rotation_order INT,
    duration INT,
    slot_id INT REFERENCES content_slots(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_slots (
  id SERIAL PRIMARY KEY,
  subject TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES

CREATE INDEX IF NOT EXISTS idx_content_subject 
ON content(subject);

CREATE INDEX IF NOT EXISTS idx_content_status 
ON content(status);

CREATE INDEX IF NOT EXISTS idx_schedule_content 
ON content_schedule(content_id);
    `;

    await client.query(createTablesQuery);

    await client.query("COMMIT");

    console.log(`Tables created successfully.`);
  } catch (error) {
    console.error(`Error creating tables.`, error);

   try {
      await client.query("ROLLBACK");
      console.log("Transaction rolled back.");
    } catch (rollbackError) {
      console.error("Error during ROLLBACK:", rollbackError);
    }
  } finally {
    client.release();
  }
};

module.exports = { createTables };