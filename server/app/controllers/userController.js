const bcrypt = require("bcryptjs");

const userModel = require("../models/userModel");
const StatusCode = require("../utils/statusCode");
const passwordValidation = require("./../utils/validation/checkPasswordValidation");

class UserController {

    async blockUnblockUser(req, res) {
        try {
            const adminId = req.params.id;

            if (!adminId) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Admin ID is required"
                })
            }

            const admin = await userModel.findById(adminId);

            if (!admin) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            if (admin.user_role !== 'admin') {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Unauthenticated"
                });
            }

            admin.isBlocked = !admin.isBlocked;
            await admin.save();

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: `User ${admin.isBlocked ? "blocked" : "unblocked"}`
            });

        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    async updatePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            const user = req.user;

            if (!user) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Unauthorised access"
                });
            }

            if (!oldPassword || !newPassword) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Old and new passwords are required"
                });
            }

            const { data, error } = passwordValidation.validate({ user_password: newPassword });

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            const userDetails = await userModel.findById(user.user_id);

            const checkOldPassword = await bcrypt.compare(oldPassword, userDetails.user_password);

            if (!checkOldPassword) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Old password doesn't match"
                });
            }
            else {
                const salt = await bcrypt.genSalt(10);
                const user_password = bcrypt.hashSync(newPassword, salt);

                userDetails.user_password = user_password;
                await userDetails.save();

                return res.status(StatusCode.SUCCESS).json({
                    success: true,
                    message: "Password updated successfully"
                });
            }
        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    async fetchProfile(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Unauthorised access"
                });
            }

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Logged profile data",
                data: user
            });
        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new UserController();