const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',          
  host: 'localhost',          
  database: 'react_express_db', 
  password: 'chicohardcore',  
  port: 5432,                 
});

module.exports = pool;