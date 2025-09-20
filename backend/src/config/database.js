const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Event handlers for pool
pool.on('connect', (client) => {
  console.log('✅ New PostgreSQL client connected');
});

pool.on('acquire', (client) => {
  console.log('📝 PostgreSQL client acquired from pool');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

pool.on('remove', (client) => {
  console.log('🗑️ PostgreSQL client removed from pool');
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('🎯 Database connection successful:');
    console.log('   Time:', result.rows[0].current_time);
    console.log('   Version:', result.rows[0].version.split(' ').slice(0, 2).join(' '));
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

// Test connection when module loads
testConnection();

module.exports = pool;
