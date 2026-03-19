const StatusCode = require("../utils/statusCode");
const userModel = require("../models/userModel");
const checkCustomerUpdateValidate = require("./../utils/validation/update/checkUpdateCustomerValidation")

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
      const customer = await userModel.findById();

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

}

module.exports = new CustomerController();