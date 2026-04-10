const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const tokenModel = require("./../models/tokenModel");
const userModel = require("./../models/userModel");
const adminModel = require("./../models/adminModel");
const STATUS_CODE = require("./../utils/statusCode");

class TokenController {

    async generateAccess(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(STATUS_CODE.NOT_FOUND).json({
                    status: false,
                    message: "Refresh token required",
                });
            }

            let decoded;
            try {
                decoded = jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET_KEY,
                );
            } catch (err) {
                return res.status(STATUS_CODE.FORBIDDEN).json({
                    status: false,
                    message: "Invalid or expired refresh token",
                });
            }

            let account = await userModel.findById(decoded.user_id);
            let existToken = await tokenModel.findOne({ userId: decoded.user_id });

            if (!account) {
                account = await adminModel.findById(decoded.user_id);
            }

            if (!account || !existToken.token) {
                return res.status(STATUS_CODE.FORBIDDEN).json({
                    status: false,
                    message: "Unauthorized",
                });
            }

            const isMatch = await bcrypt.compare(refreshToken, existToken.token);

            if (!isMatch) {
                return res.status(STATUS_CODE.FORBIDDEN).json({
                    status: false,
                    message: "Refresh token mismatch",
                });
            }

            const newAccessToken = jwt.sign(
                {
                    user_id: account._id,
                    user_name: account.user_name,
                    user_email: account.user_email,
                    user_role: account.user_role
                },
                process.env.ACCESS_TOKEN_SECRET_KEY,
                { expiresIn: "1h" },
            );

            const newRefreshToken = jwt.sign(
                {
                    user_id: account._id,
                    user_name: account.user_name,
                    user_email: account.user_email,
                    user_role: account.user_role
                },
                process.env.REFRESH_TOKEN_SECRET_KEY,
                { expiresIn: "7d" },
            );

            const hashedToken = await bcrypt.hash(newRefreshToken, 10);

            existToken.token = hashedToken;
            await existToken.save();

            return res.status(STATUS_CODE.SUCCESS).json({
                status: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                message: "Token refreshed successfully",
            });
        } catch (err) {
            return res.status(STATUS_CODE.BAD_GATEWAY).json({
                status: false,
                message: err.message
            });
        }
    }
}

module.exports = new TokenController();