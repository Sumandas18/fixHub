const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../../utils/statusCode");
const userModel = require("../../models/userModel");
const checkProviderValidate = require("../../utils/validation/create/checkCreateProviderValidation");

class ProviderAuthController {

    async providerRegister(req, res) {
        try {
            const { user_name, user_email, user_password, user_contact, user_role, user_address } = req.body;

            if (!user_name || !user_email || !user_password) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled",
                });
            }

            const { error } = checkProviderValidate.validate(req.body);

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map((err) => err.message),
                });
            }

            const existProvider = await userModel.findOne({ user_email });

            if (existProvider) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exists",
                });
            }

            const hashedPassword = await bcrypt.hash(user_password, 10);

            const provider = await userModel.create({
                user_name,
                user_email,
                user_password: hashedPassword,
                user_contact,
                user_role,
                doc_url: req.file ? req.file.path : null,
                user_address,
            });

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Provider registered successfully",
                data: provider,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async providerLogin(req, res) {
        try {
            const { user_email, user_password } = req.body;

            const user = await userModel.findOne({ user_email });

            if (!user) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Provider not found",
                });
            }


            const isMatch = await bcrypt.compare(user_password, user.user_password);
            if (!verifyPassword) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid password"
                });
            }
            else {
                const token = jwt.sign({
                    user_id: existProvider._id,
                    user_name: existProvider.user_name,
                    user_email: existProvider.user_email,
                    user_role: existProvider.user_role,
                    user_address: existProvider.user_address,
                    user_contact: existProvider.user_contact
                }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

                existProvider.lastLogin = Date.now();
                await existProvider.save();

                return res.status(StatusCode.SUCCESS).json({
                    success: true,
                    message: "Login successful",
                    data: {
                        user_id: existProvider._id,
                        user_name: existProvider.user_name,
                        user_email: existProvider.user_email,
                        user_role: existProvider.user_role,
                        user_address: existProvider.user_address,
                        user_contact: existProvider.user_contact
                    },
                    token
                });
            }

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

}

module.exports = new ProviderAuthController();