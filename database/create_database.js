/* eslint-disable no-unused-vars */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

client.connect();

client.query('DROP TABLE IF EXISTS settings', (err, res) => {
    if (err) {
        console.log(err.stack);
    }
    else {
        console.log(1);
    }
});

client.query(`
    CREATE TABLE IF NOT EXISTS settings (
        user_id        CHAR(24) NOT NULL  PRIMARY KEY,
        auth_token     UUID     NOT NULL,
        device_id      UUID     NOT NULL,
        timestamp_hash UUID     NOT NULL,

        bot_id         CHAR(24) NOT NULL,
        chat_id        CHAR(24) NOT NULL,

        guild_id       BIGINT   NOT NULL,

        name           VARCHAR(64)
    );
`, (err, res) => {
    if (err) {
        console.log(err.stack);
    }
    else {
        console.log(2);
    }
});