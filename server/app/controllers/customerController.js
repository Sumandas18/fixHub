const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/statusCode");
const userModel = require("../models/userModel");
const checkCustomerValidate = require("../utils/validation/checkCustomerValidation");

class CustomerController {

  async customerRegister(req, res) {
    try {
      const {
        user_name,
        user_email,
        user_password,
        user_contact,
        user_role,
        user_address,
      } = req.body;

      if (
        !user_name ||
        !user_email ||
        !user_password ||
        !user_contact ||
        !user_address ||
        !user_address.houseOrFlatNo ||
        !user_address.street ||
        !user_address.area ||
        !user_address.city ||
        !user_address.state ||
        !user_address.pinCode
      ) {
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

      const hashedPassword = await bcrypt.hash(user_password, 10);

      const customer = await userModel.create({
        user_name,
        user_email,
        user_password: hashedPassword,
        user_contact,
        user_role,
        user_address,
      });

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Registration successful",
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

      const user = await userModel.findOne({ user_email });

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(user_password, user.user_password);

      if (!isMatch) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          _id: user._id,
          user_role: user.user_role,
          user_email: user.user_email,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Login successful",
        data: user,
        token,
      });

    } catch (err) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  async getCustomer(req, res) {
    try {
      const customers = await userModel.find({ user_role: "customer" });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: customers,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCustomerById(req, res) {
    try {
      const customer = await userModel.findById(req.params.id);

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Customer not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: customer,
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

      if (
        req.user.user_role !== "customer" ||
        req.user._id.toString() !== customerId
      ) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const updateData = { ...req.body };

      const updatedCustomer = await userModel.findByIdAndUpdate(
        customerId,
        updateData,
        { new: true, runValidators: true }
      );

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Updated successfully",
        data: updatedCustomer,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteCustomer(req, res) {
    try {
      const customerId = req.params.id;

      if (
        req.user.user_role !== "customer" ||
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
        message: "Customer deleted",
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CustomerController();