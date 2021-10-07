require('dotenv').config();
const { Pool } = require('pg');

const prefixes = { 'full': 2, 'partial': 1, 'none': 0 };

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function insert_replika(params) {
    const client = await pool.connect();
    const query = `
        INSERT INTO settings (
            user_id,
            auth_token,
            device_id,
            timestamp_hash,

            bot_id, 
            chat_id, 

            guild_id, 

            name,
            avatar
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    try {
        await client.query(
            query,
            [params['x-user-id'], params['x-auth-token'], params['x-device-id'], params['x-timestamp-hash'],
                params['bot_id'], params['chat_id'],
                params['guild_id'],
                params['name'], params['avatar']],
        );
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
    finally {
        client.release();
    }
}

async function delete_replika(user_id) {
    const client = await pool.connect();
    const query = 'DELETE FROM settings where user_id = $1';
    try {
        await client.query(query, [user_id]);
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
    finally {
        client.release();
    }
}

async function delete_guild(guild_id) {
    const client = await pool.connect();
    const query = 'DELETE FROM settings where guild_id = $1';
    try {
        await client.query(query, [guild_id]);
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
    finally {
        client.release();
    }
}

async function is_registered(user_id, guild_id) {
    const client = await pool.connect();
    let res;
    try {
        res = await client.query('SELECT * FROM settings WHERE user_id = $1', [user_id]);
    }
    catch (error) {
        console.log(error);
        return -1;
    }
    finally {
        client.release();
    }

    if (res.rows.length === 0) {
        return 0;
    }
    else if (res.rows[0]['guild_id'] == guild_id) {
        return 1;
    }
    else {
        return res.rows[0];
    }
}

async function list_replikas(guild_id) {
    const client = await pool.connect();
    try {
        return await client.query('SELECT * FROM settings WHERE guild_id = $1', [guild_id]);
    }
    catch (error) {
        console.log(error);
        return;
    }
    finally {
        client.release();
    }
}

async function update_data(replika) {
    const user_id = replika.auth.user_id;
    const name = replika.name;
    const avatar = replika.avatar;
    const prefix = prefixes[replika.prefix];
    const client = await pool.connect();
    try {
        return await client.query(
            'UPDATE settings SET name = $1, avatar = $2, prefix = $3 WHERE user_id = $4',
            [name, avatar, prefix, user_id]);
    }
    catch (error) {
        console.log(error);
        return;
    }
    finally {
        client.release();
    }
}


module.exports = {
    insert_replika: insert_replika,
    delete_replika: delete_replika,
    delete_guild: delete_guild,
    is_registered: is_registered,
    list_replikas: list_replikas,
    update_data: update_data,
};