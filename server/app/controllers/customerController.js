const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/statusCode");
const userModel = require("../models/userModel");
const checkCustomerValidate = require("./../utils/validation/checkCustomerValidation");

class CustomerController {

    async customerRegister(req, res) {
        try {
            const { user_name, user_email, user_password, user_contact, user_role, user_address } = req.body;

            if (!user_name || !user_email || !user_password || !user_contact || !user_address || !user_address.houseOrFlatNo ||
                !user_address.street || !user_address.area || !user_address.city || !user_address.state || !user_address.pinCode) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            const { data, error } = checkCustomerValidate.validate(req.body);

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            const existCustomer = await userModel.findOne({ user_email });

            if (existCustomer) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exists"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user_password, salt);

            const customerObj = new userModel({
                user_name, user_email, user_password: hashedPassword, user_contact, user_role,
                user_address: {
                    houseOrFlatNo: user_address.houseOrFlatNo,
                    buildingName: user_address.buildingName,
                    street: user_address.street,
                    area: user_address.area,
                    landmark: user_address.landmark,
                    city: user_address.city,
                    district: user_address.district,
                    state: user_address.state,
                    pinCode: user_address.pinCode,
                    country: user_address.country
                }
            });

            const customer = await customerObj.save();

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Registration successful. Please verify your email",
                data: customer
            });

        } catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async customerLogin(req, res) {
        try {
            const { user_email, user_password } = req.body;

            if (!user_email || !user_password) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            const existCustomer = await userModel.find({ user_email });
            if (!existCustomer) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User doesn't exist"
                });
            }
            else {
                const verifyPassword = await bcrypt.compare(existCustomer.user_password, user_password);

                if (!verifyPassword) {
                    return res.status(StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Invalid password"
                    });
                }
                else {
                    const token = jwt.sign({
                        user_name: existCustomer.user_name,
                        user_email: existCustomer.user_email,
                        user_role: existCustomer.user_role,
                        user_address: existCustomer.user_address,
                        user_contact: existCustomer.user_contact
                    }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

                    return res.status(StatusCode.SUCCESS).json({
                        success: true,
                        message: "Login successful",
                        data: {
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
        }
        catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }
}

module.exports = new CustomerController();