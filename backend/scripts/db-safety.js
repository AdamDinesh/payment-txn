function blockProduction(command) {
    if (process.env.NODE_ENV === 'production') {
        console.error(`❌ ${command} is not allowed in production.`);
        process.exitCode = 1;
        return true;
    }

    return false;
}

module.exports = { blockProduction };