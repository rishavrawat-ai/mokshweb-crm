
(async () => {
    const net = require('net');
    const client = new net.Socket();

    client.connect(5432, '127.0.0.1', () => {
        console.log('Connected to PostgreSQL port 5432');
        client.destroy();
    });

    client.on('error', (err) => {
        console.error('Connection failed:', err.message);
    });
})();
