import { Pool } from 'pg';

let pool: Pool;

declare global {
  // eslint-disable-next-line no-var
  var _postgresPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!global._postgresPool) {
  global._postgresPool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

pool = global._postgresPool;

export default pool;
