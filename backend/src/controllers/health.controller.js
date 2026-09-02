const db = require('../config/db');

const healthCheck = async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.status(200).json({ status: 'ok', server: 'healthy', database: 'healthy' });

    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({ status: 'unhealthy', server: 'healthy', database: 'unhealthy' });
    }
};

module.exports = healthCheck;