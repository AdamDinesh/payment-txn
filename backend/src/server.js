require('dotenv').config();

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

const app = require('./app');
const db = require('./config/db');
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await db.query('SELECT 1');
        console.log('Database connected.');
        server = app.listen(PORT, () => {
            console.log(
                `Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);

        });
    } catch (error) {
        console.error('Failed to start server:', error);
        await db.end();
        process.exit(1);
    }
}

async function shutdown(signal) {
    console.log(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
        await db.end();
        console.log('Server closed.');
        process.exit(0);
    });
}

startServer();