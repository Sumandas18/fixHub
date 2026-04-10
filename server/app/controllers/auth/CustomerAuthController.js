const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../../utils/statusCode");
const userModel = require("../../models/userModel");
const otpModel = require("../../models/otpModel");
const checkCustomerValidate = require("../../utils/validation/create/checkCreateCustomerValidation");
const sendOTPMails = require("../../utils/sendMail");

class CustomerAuthController {

    async customerRegister(req, res) {
        try {
            const { user_name, user_email, user_password, user_contact, user_address } = req.body;

            if (!user_name || !user_email || !user_password || !user_contact || !user_address || !user_address.houseOrFlatNo ||
                !user_address.street || !user_address.area || !user_address.city || !user_address.state || !user_address.pinCode) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled",
                });
            }

            const { error } = checkCustomerValidate.validate(req.body);

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map((err) => err.message),
                });
            }

            const existCustomer = await userModel.findOne({ user_email });

            if (existCustomer) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exists",
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = bcrypt.hashSync(user_password, salt);
            const otp = Math.floor(1000 + Math.random() * 9000);

            const customer = await userModel.create({
                user_name, user_email, user_password: hashPassword, user_contact, user_role: "customer", user_address
            });

            const otpObj = new otpModel({ userId: customer._id, otp });
            await otpObj.save();

            await sendOTPMails({ user: customer, type: "newRegister", otp });

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Registration successful. Please verify your email",
                data: customer,
            });

        } catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
        }
    }

    async customerLogin(req, res) {
        try {
            const { user_email, user_password } = req.body;

            if (!user_email || !user_password) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled",
                });
            }

            const existCustomer = await userModel.findOne({ user_email });

            if (!existCustomer || existCustomer.user_role != "customer") {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User not found",
                });
            }
            else {
                if (!existCustomer.isVerified) {
                    return res.status(StatusCode.BAD_GATEWAY).json({
                        success: false,
                        message: "Email not verified yet"
                    });
                }
                else if (existCustomer.isBlocked) {
                    return res.status(StatusCode.BAD_GATEWAY).json({
                        success: false,
                        message: "Account is blocked"
                    });
                }
                else {
                    const isMatch = await bcrypt.compare(user_password, existCustomer.user_password);

                    if (!isMatch) {
                        return res.status(StatusCode.BAD_REQUEST).json({
                            success: false,
                            message: "Invalid password",
                        });
                    }

                    const token = jwt.sign({
                        user_id: existCustomer._id,
                        user_role: existCustomer.user_role,
                        user_email: existCustomer.user_email,
                        user_name: existCustomer.user_name
                    },
                        process.env.JWT_SECRET_KEY, { expiresIn: "1h" }
                    );

                    existCustomer.lastLogin = Date.now();
                    await existCustomer.save();

                    return res.status(StatusCode.SUCCESS).json({
                        success: true,
                        message: "Login successful",
                        data: {
                            user_id: existCustomer._id,
                            user_name: existCustomer.user_name,
                            user_email: existCustomer.user_email,
                            user_role: existCustomer.user_role,
                            user_address: existCustomer.user_address,
                            user_contact: existCustomer.user_contact
                        },
                        token
                    });
                }
            }

        } catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
        }
    }
}

module.exports = new CustomerAuthController();