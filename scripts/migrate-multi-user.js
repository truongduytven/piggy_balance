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

async function runMultiUserMigration() {
  console.log('🚀 Bắt đầu nâng cấp cơ sở dữ liệu Multi-User...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Tạo bảng users nếu chưa có
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(128) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Bảng users đã sẵn sàng.');

    // 2. Thêm cột user_id vào bảng months nếu chưa có
    await client.query(`
      ALTER TABLE months 
      ADD COLUMN IF NOT EXISTS user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE;
    `);
    console.log('✅ Cột months.user_id đã sẵn sàng.');

    // 3. Khởi tạo/cập nhật tài khoản Joshua (mật khẩu: Congchua1802)
    const joshuaPassword = 'Congchua1802';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(joshuaPassword, saltRounds);

    const existingUserRes = await client.query(
      `SELECT id, username FROM users WHERE LOWER(username) = LOWER($1)`,
      ['Joshua']
    );

    let joshuaId = 'usr-joshua';
    if (existingUserRes.rows.length === 0) {
      await client.query(
        `INSERT INTO users (id, username, password_hash, display_name)
         VALUES ($1, $2, $3, $4)`,
        [joshuaId, 'Joshua', passwordHash, 'Joshua']
      );
      console.log('✨ Đã tạo tài khoản đầu tiên: Joshua (mật khẩu: Congchua1802)');
    } else {
      joshuaId = existingUserRes.rows[0].id;
      await client.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [passwordHash, joshuaId]
      );
      console.log('✨ Đã cập nhật mật khẩu cho tài khoản Joshua thành Congchua1802');
    }

    // 4. Gom toàn bộ các tháng hiện có về tài khoản Joshua
    const updateRes = await client.query(
      `UPDATE months SET user_id = $1 WHERE user_id IS NULL`,
      [joshuaId]
    );
    console.log(`📦 Đã gán ${updateRes.rowCount} tháng hiện có vào tài khoản Joshua.`);

    await client.query('COMMIT');
    console.log('🎉 Hoàn thành nâng cấp cơ sở dữ liệu Multi-User thành công!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi chạy migration multi-user:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMultiUserMigration();
