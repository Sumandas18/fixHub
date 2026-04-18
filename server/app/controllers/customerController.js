const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const StatusCode = require("../utils/statusCode");
const userModel = require("../models/userModel");
const checkCustomerUpdateValidate = require("./../utils/validation/update/checkUpdateCustomerValidation");
const sendOTPMails = require("../utils/sendMail");

class CustomerController {

  async getAllCustomer(req, res) {
    try {
      const customers = await userModel.find({ user_role: "customer" });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        count: customers.length,
        data: customers
      });

    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCustomerById(req, res) {
    try {
      const customerId = req.params.id;

      if (!customerId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Customer ID is required"
        })
      }
      const customer = await userModel.findById(customerId);

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Customer not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Specific customer details",
        data: customer
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateCustomer(req, res) {
    try {
      const customerId = req.params.id;

      if (req.user.user_role !== "customer" || req.user._id.toString() !== customerId) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { data, error } = checkCustomerUpdateValidate.validate(req.body);

      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details.map(err => err.message)
        });
      }

      const updatedCustomer = await userModel.findByIdAndUpdate(
        customerId, req.body, { new: true, runValidators: true });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Updated successfully"
      });

    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async blockUnblockCustomer(req, res) {
    try {
      const customer = await userModel.findById(req.params.id);

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "User not found"
        });
      }

      if (customer.user_role !== 'customer') {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthenticated"
        });
      }

      customer.isBlocked = !customer.isBlocked;
      await customer.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `User ${customer.isBlocked ? "blocked" : "unblocked"}`
      });

    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteCustomer(req, res) {
    try {
      const customerId = req.params.id;

      if (
        req.user.user_role === "customer" &&
        req.user._id.toString() !== customerId
      ) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await userModel.findByIdAndDelete(customerId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Customer deleted successfully",
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  
    async resetPasswordLink(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(STATUS_CODE.NOT_FOUND).json({
                    success: false,
                    message: "All fields required"
                });
            }

            const existingUser = await userModel.findOne({ user_email: email });

            if (!existingUser) {
                return res.status(STATUS_CODE.BAD_GATEWAY).json({
                    success: false,
                    message: "User not found"
                });
            }

            const secret = existingUser._id + process.env.JWT_SECRET_KEY;
            const secretLink = jwt.sign({ userId: existingUser._id }, secret, { expiresIn: '10m' });

            const resetPasswordLink = `${process.env.FRONTEND_LINK}/user/reset-password/${existingUser._id}/${secretLink}`;

            await sendOTPMails({ user: existingUser, link: resetPasswordLink, type: 'forgetPassword' });

            return res.status(StatusCode.OK).json({
                status: true,
                message: "Password reset email sent. Please check your email."
            });
        }
        catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const { password, confirmPassword } = req.body;
            const { id, token } = req.params;

            if (!id || !token) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "All parameters are required"
                })
            }

            if (!password || !confirmPassword) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "All fields are required"
                })
            }
            else if (password != confirmPassword) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "Password and confirm password are not same"
                })
            }
            else {
                const existingUser = await userModel.findById(id);

                if (!existingUser) {
                    return res.status(StatusCode.NOT_FOUND).json({
                        success: false,
                        message: "User not available"
                    })
                }
                else {
                    const secret = id + process.env.JWT_SECRET_KEY;

                    await jwt.verify(token, secret);

                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = bcrypt.hashSync(password, salt);

                    const checkPassword = await bcrypt.compare(existingUser.password, hashPassword);

                    if (checkPassword) {
                        return res.status(StatusCode.BAD_GATEWAY).json({
                            success: false,
                            message: "New password and old password can't be same"
                        })
                    }
                    else {
                        existingUser.password = hashPassword;
                        await existingUser.save();

                        return res.status(StatusCode.OK).json({
                            success: true,
                            message: "Password reset successfully"
                        })
                    }
                }
            }
        }
        catch (err) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: "Unable to reset password. Please try again later"
            });
        }
    }

}

module.exports = new CustomerController();