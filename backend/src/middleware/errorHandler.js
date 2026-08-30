function errorHandler(err, req, res, next) {
    console.error(err);

    const statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'production') {
        return res.status(statusCode).json({
            error: {
                message:
                    statusCode === 500
                        ? 'Internal server error'
                        : err.message,
            },
        });
    }

    return res.status(statusCode).json({
        error: {
            message: err.message,
            stack: err.stack,
        },
    });
}

module.exports = errorHandler;