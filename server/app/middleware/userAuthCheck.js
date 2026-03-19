const jwt = require('jsonwebtoken');
const StatusCode = require('../utils/statusCode');


const userAuthCheck = (accessedRole = []) => {

    return async (req, res, next) => {

        const token = req.body?.token || req.query?.token || req.headers['x-access-token'] || req.headers['authorization'];

        if (!token) {
            return res.status(StatusCode.NOT_FOUND).json({
                status: false,
                message: 'Token is required'
            })
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            if (!accessedRole.includes(decoded.user_role)) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    status: false,
                    message: 'Invalid credentials'
                })
            }
            else {
                req.user = decoded;
            }

        } catch (err) {
            return res.status(StatusCode.BAD_GATEWAY).json({
                status: false,
                message: "invalid token"
            })
        }
        return next();

    }
}


module.exports = userAuthCheck