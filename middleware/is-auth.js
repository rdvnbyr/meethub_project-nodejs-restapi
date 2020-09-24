const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const authorizationHeader = req.get('Authorization');
        if (!authorizationHeader) {
            const error = new Error('User not authenticated');
            error.statusCode = 401;
            throw error;
        };
        const token = authorizationHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, 'jwt_secret_key');
        if (!decodedToken) {
            const error = new Error('Not autenticated');
            error.statusCode = 401;
            throw error;
        };
        req.userId = decodedToken.userId;
        next();

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    };
};