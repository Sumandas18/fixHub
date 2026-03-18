const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/statusCode");
const userModel = require("./../models/userModel");
const checkProviderValidate = require("./../utils/validation/checkProviderValidation");
class ProviderController {

    async providerRegister(req, res) {
        try {
            let doc_url;
            const { user_name, user_email, user_password, user_contact, user_role, user_address } = req.body;

            if (!user_name || !user_email || !user_password || !user_contact || !user_address || !user_address.houseOrFlatNo ||
                !user_address.street || !user_address.area || !user_address.city || !user_address.state || !user_address.pinCode) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            const { data, error } = checkProviderValidate.validate(req.body);

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            const existProvider = await userModel.findOne({ user_email });

            if (existProvider) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exists"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user_password, salt);

            if (req.file) {
                doc_url = req.file.path;
            }
            const providerObj = new userModel({
                user_name, user_email, user_password: hashedPassword, user_contact, user_role, doc_url,
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

            const provider = await providerObj.save();

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Registration successful. Please verify your email",
                data: provider
            });

        } catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async providerLogin(req, res) {
        try {
            const { user_email, user_password } = req.body;

            if (!user_email || !user_password) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            const existProvider = await userModel.find({ user_email });
            if (!existProvider) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User doesn't exist"
                });
            }
            else {
                const verifyPassword = await bcrypt.compare(existProvider.user_password, user_password);

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

                    return res.status(StatusCode.SUCCESS).json({
                        success: true,
                        message: "Login successful",
                        data: {
                            user_name: existProvider.user_name,
                            user_email: existProvider.user_email,
                            user_role: existProvider.user_role,
                            user_address: existProvider.user_address,
                            user_contact: existProvider.user_contact
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

module.exports = new ProviderController();