const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Đọc biến môi trường từ .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Lỗi: DATABASE_URL không tìm thấy trong file .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runCleanMigration() {
  console.log('🧹 Bắt đầu Clean & Migrate cơ sở dữ liệu: XÓA SẠCH TOÀN BỘ DỮ LIỆU CŨ...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Xóa sạch các bảng cũ nếu đã tồn tại
    await client.query(`DROP TABLE IF EXISTS expenses CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS weeks CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS fixed_expenses CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS months CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS users CASCADE;`);

    // 0. Tạo bảng users
    await client.query(`
      CREATE TABLE users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(128) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 1. Tạo bảng months
    await client.query(`
      CREATE TABLE months (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(64) NOT NULL,
        year INT NOT NULL,
        month_number INT NOT NULL,
        initial_money BIGINT NOT NULL,
        locked_weekly_budget BIGINT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Tạo bảng fixed_expenses
    await client.query(`
      CREATE TABLE fixed_expenses (
        id VARCHAR(64) PRIMARY KEY,
        month_id VARCHAR(32) REFERENCES months(id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        amount BIGINT NOT NULL,
        icon VARCHAR(16) DEFAULT '💡',
        is_paid BOOLEAN DEFAULT true
      );
    `);

    // 3. Tạo bảng weeks
    await client.query(`
      CREATE TABLE weeks (
        id VARCHAR(64) PRIMARY KEY,
        month_id VARCHAR(32) REFERENCES months(id) ON DELETE CASCADE,
        week_index INT NOT NULL,
        name VARCHAR(32) NOT NULL,
        start_date VARCHAR(16) NOT NULL,
        end_date VARCHAR(16) NOT NULL,
        full_start_date VARCHAR(32) NOT NULL,
        full_end_date VARCHAR(32) NOT NULL,
        is_current BOOLEAN DEFAULT false
      );
    `);

    // 4. Tạo bảng expenses
    await client.query(`
      CREATE TABLE expenses (
        id VARCHAR(64) PRIMARY KEY,
        month_id VARCHAR(32) REFERENCES months(id) ON DELETE CASCADE,
        amount BIGINT NOT NULL,
        category VARCHAR(32) NOT NULL,
        description TEXT NOT NULL,
        date VARCHAR(16) NOT NULL,
        week_index INT NOT NULL,
        wallet VARCHAR(32) DEFAULT 'Ví chính',
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Seed tài khoản mặc định Joshua
    const joshuaHash = await bcrypt.hash('Congchua1802', 10);
    await client.query(`
      INSERT INTO users (id, username, password_hash, display_name)
      VALUES ('usr-joshua', 'Joshua', $1, 'Joshua');
    `, [joshuaHash]);

    await client.query('COMMIT');
    console.log('✨ Đã tạo bảng và tài khoản mặc định Joshua (mật khẩu: Congchua1802) thành công!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi chạy clean migration:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runCleanMigration();
