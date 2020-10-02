
module.exports = async (req, res, next) => {
    try {
        if (req.status === 'admin') {
            next();
        } else {
            const error = new Error('Not autenticated');
            error.statusCode = 401;
            throw error;
        };

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    };
};