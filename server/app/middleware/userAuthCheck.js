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
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

            if (!accessedRole.includes(decoded.user_role)) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    status: false,
                    message: 'Invalid credentials'
                })
            }
            else {
                req.user = decoded;
                next();
            }

        } catch (err) {

            if (err.name === "TokenExpiredError") {
                return res.status(StatusCode.UNAUTHORIZED).json({
                    status: false,
                    message: "Token expired",
                });
            }

            if (err.name === "JsonWebTokenError") {
                return res.status(StatusCode.UNAUTHORIZED).json({
                    status: false,
                    message: "Invalid token",
                });
            }
            return res.status(StatusCode.UNAUTHORIZED).json({
                status: false,
                message: "Authentication failed"
            })
        }

    }
}


module.exports = userAuthCheck