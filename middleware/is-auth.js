const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const authorizationHeader = req.get('Authorization'); //'Bearer adljopajpgeao[ejo[jvwjv02u0jvow[j[kwvkwkvkp]j40=vk'
        if (!authorizationHeader) {
            const error = new Error('Not authenticated');
            error.statusCode(401);
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
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(error);
    };
};