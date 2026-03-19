const StatusCode = require("../utils/statusCode");
const userModel = require("../models/userModel");

class AdminController {

  async getAllAdmins(req, res) {
    try {
      const admins = await userModel.find({ user_role: "admin" });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        count: admins.length,
        data: admins
      });
    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteAdmin(req, res) {
    try {
      const adminId = req.params.id;

      if (!adminId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Admin ID is required"
        })
      }
      const user = await userModel.findByIdAndDelete(adminId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "User deleted"
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

module.exports = new AdminController();