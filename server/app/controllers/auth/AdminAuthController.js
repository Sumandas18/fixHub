const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const StatusCode = require("../../utils/statusCode");
const userModel = require("../../models/userModel");
const otpModel = require("../../models/otpModel");
const checkAdminValidate = require("../../utils/validation/create/checkCreateAdminValidation");
const sendOTPMails = require("../../utils/sendMail");

class AdminAuthController {

    async adminRegister(req, res) {
        try {
            const { user_name, user_email, user_password } = req.body;

            if (!user_name || !user_email || !user_password) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            const { data, error } = checkAdminValidate.validate({ user_name, user_email, user_password });

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            const existAdmin = await userModel.findOne({ user_email });
            if (existAdmin) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exist"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = bcrypt.hashSync(user_password, salt);
            const otp = Math.floor(1000 + Math.random() * 9000);

            const adminObj = new userModel({ user_name, user_email, user_password: hashPassword, user_role: "admin" });
            const admin = await adminObj.save();

            const otpObj = new otpModel({ userId: admin._id, otp });
            await otpObj.save();

            await sendOTPMails({ user: admin, type: "newRegister", otp });

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Registration successful. Please verify your email",
                data: admin
            });
        }
        catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async adminLogin(req, res) {
        try {
            const { user_email, user_password } = req.body;

            if (!user_email || !user_password) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            const existAdmin = await userModel.findOne({ user_email });
            if (!existAdmin || existAdmin.user_role != "admin") {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User doesn't exist"
                });
            }
            else {
                if (!existAdmin.isVerified) {
                    return res.status(StatusCode.BAD_GATEWAY).json({
                        success: false,
                        message: "Email not verified yet"
                    });
                }
                else if (existAdmin.isBlocked) {
                    return res.status(StatusCode.BAD_GATEWAY).json({
                        success: false,
                        message: "Account is blocked"
                    });
                }
                else {
                    const verifyPassword = await bcrypt.compare(user_password, existAdmin.user_password);

                    if (!verifyPassword) {
                        return res.status(StatusCode.BAD_REQUEST).json({
                            success: false,
                            message: "Invalid password"
                        });
                    }
                    else {
                        const token = jwt.sign({
                            user_id: existAdmin._id,
                            user_name: existAdmin.user_name,
                            user_email: existAdmin.user_email,
                            user_role: existAdmin.user_role
                        }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

                        existAdmin.lastLogin = Date.now();
                        await existAdmin.save();

                        return res.status(StatusCode.SUCCESS).json({
                            success: true,
                            message: "Login successful",
                            data: {
                                user_name: existAdmin.user_name,
                                user_email: existAdmin.user_email,
                                user_role: existAdmin.user_role
                            },
                            token
                        });
                    }
                }
            }
        }
        catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

}

module.exports = new AdminAuthController();