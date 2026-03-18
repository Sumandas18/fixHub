const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/statusCode");
const userModel = require("./../models/userModel");
const checkAdminValidate = require("./../utils/validation/checkAdminValidation");

class AdminController {

    async adminRegister(req, res) {
        try {
            const { user_name, user_email, user_password, user_role } = req.body;

            if (!user_name || !user_email || !user_password || !user_role) {
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

            const existAdmin = await userModel.find({ user_email });
            if (existAdmin) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exist"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = bcrypt.hashSync(password, salt);

            const adminObj = new userModel({ user_name, user_email, user_password: hashPassword, user_role });

            const admin = await adminObj.save();

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Registration successful.",
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

            const existAdmin = await userModel.find({ user_email });
            if (!existAdmin) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User doesn't exist"
                });
            }
            else {
                const verifyPassword = await bcrypt.compare(existAdmin.user_password, user_password);

                if (!verifyPassword) {
                    return res.status(StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Invalid password"
                    });
                }
                else {
                    const token = jwt.sign({
                        user_name: existAdmin.user_name,
                        user_email: existAdmin.user_email,
                        user_role: existAdmin.user_role
                    }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

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
        catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }
}

module.exports = new AdminController();