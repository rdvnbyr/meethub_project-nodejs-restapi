
module.exports = async (req, res, next) => {
    try {
        if (req.isAdmin) {
            next();
        } else {
            const error = new Error('You are not authorized this action.');
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