
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres', // Connect to default DB first
    password: 'postgres', // Common default
    port: 5432,
});

async function test() {
    try {
        await client.connect();
        console.log('Connected to Postgres successfully!');
        await client.end();
    } catch (err) {
        console.error('Connection error:', err.message);
        if (err.message.includes('password authentication failed')) {
            console.log('HINT: Password validation failed.');
        }
    }
}

test();
