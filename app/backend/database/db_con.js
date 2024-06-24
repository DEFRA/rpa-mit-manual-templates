const dotenv = require('dotenv');
dotenv.config();
const db_con = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    }
  });
module.exports = db_con;