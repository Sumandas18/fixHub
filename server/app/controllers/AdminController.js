// const bcrypt = require("bcryptjs");
// const StatusCode = require("../utils/statusCode");
// const userModel = require("../models/userModel");
// const otpModel = require("../models/otpModel");
// const passwordValidation = require("./../utils/validation/checkPasswordValidation");
// const sendOTPMails = require("../utils/sendMail");
// const generateOTP = require("../helper/generateOTP");

// class AdminController {

//   async getAllAdmins(req, res) {
//     try {
//       const admins = await userModel.find({ user_role: "admin" });

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         count: admins.length,
//         data: admins
//       });
//     }
//     catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async deleteAdmin(req, res) {
//     try {
//       const adminId = req.params.id;

//       if (!adminId) {
//         return res.status(StatusCode.NOT_FOUND).json({
//           success: false,
//           message: "Admin ID is required"
//         })
//       }
//       const user = await userModel.findByIdAndDelete(adminId);

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "User deleted"
//       });

//     }
//     catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async verifyAdminOTP(req, res) {
//     try {
//       const { email, otp } = req.body;

//       if (!email || !otp) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "All fields are required"
//         })
//       }

//       const admin = await userModel.findOne({ email, user_role: "admin" });

//       if (!admin) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "Invalid email"
//         })
//       }

//       const checkOTP = await otpModel.findOne({ userId: admin._id, otp });

//       if (!checkOTP) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "Invalid OTP"
//         })
//       }

//       await userModel.findByIdAndUpdate(admin._id, { isVerified: true });
//       await otpModel.deleteOne({ userId: admin._id });

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "Admin verified successfully"
//       });
//     }
//     catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async adminResendOTP(req, res) {
//     try {
//       const { email } = req.body;

//       if (!email) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "Email is required"
//         })
//       }

//       const admin = await userModel.findOne({ email, user_role: "admin" });

//       if (!admin) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "Invalid email"
//         })
//       }

//       if (admin.isVerified) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "Admin already verified"
//         })
//       }

//       const otp = generateOTP();
//       const otpObj = new otpModel({ userId: admin._id, otp });
//       await otpObj.save();

//       await sendOTPMails({ user: admin, otp, type: "resendOTP" });

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "OTP re-sent successfully"
//       });
//     }
//     catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async updateAdminPassword(req, res) {
//     try {
//       const { oldPassword, newPassword, confirmPassword } = req.body;
//       const adminId = req.user.id;

//       if (!oldPassword || !newPassword || !confirmPassword) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "All fields are required"
//         })
//       }

//       if (newPassword !== confirmPassword) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "New password and confirm password do not match"
//         })
//       }

//       const passwordCheck = passwordValidation(newPassword);

//       if (!passwordCheck.isValid) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: passwordCheck.message
//         })
//       }

//       const admin = await userModel.findById(adminId);

//       if (!admin) {
//         return res.status(StatusCode.NOT_FOUND).json({
//           success: false,
//           message: "Admin not found"
//         })
//       }

//       const isPasswordCorrect = await bcrypt.compare(oldPassword, admin.password);

//       if (!isPasswordCorrect) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "Old password is incorrect"
//         })
//       }

//       const hashedPassword = await bcrypt.hash(newPassword, 10);
//       await userModel.findByIdAndUpdate(adminId, { password: hashedPassword });

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "Password updated successfully"
//       });
//     }
//     catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async blockUnblockAdmin(req, res) {
//     try {
//       const adminId = req.params.id;

//       if (!adminId) {
//         return res.status(StatusCode.NOT_FOUND).json({
//           success: false,
//           message: "Admin ID is required"
//         })
//       }

//       const admin = await userModel.findById(adminId);

//       if (!admin) {
//         return res.status(StatusCode.NOT_FOUND).json({
//           success: false,
//           message: "Admin not found"
//         })
//       }

//       const updatedStatus = !admin.isBlocked;

//       await userModel.findByIdAndUpdate(adminId, { isBlocked: updatedStatus });

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: `Admin ${updatedStatus ? 'blocked' : 'unblocked'} successfully`,
//         isBlocked: updatedStatus
//       });
//     }
//     catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

// }

// module.exports = new AdminController();



















const bcrypt = require("bcryptjs");
const StatusCode = require("../utils/statusCode");
const adminModel = require("../models/adminModel"); // ✅ FIXED
const otpModel = require("../models/otpModel");
const passwordValidation = require("./../utils/validation/checkPasswordValidation");
const sendOTPMails = require("../utils/sendMail");
const generateOTP = require("../helper/generateOTP");

class AdminController {

  async getAllAdmins(req, res) {
    try {
      const admins = await adminModel.find();

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
      const requestingAdminId = req.user?.user_id;

      if (!adminId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Admin ID is required"
        });
      }

      // Security: prevent self-deletion
      if (adminId === String(requestingAdminId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "You cannot delete your own account"
        });
      }

      const admin = await adminModel.findById(adminId);
      if (!admin) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Admin not found"
        });
      }

      await adminModel.findByIdAndDelete(adminId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Admin deleted successfully"
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }


  // ================= OTP VERIFY =================

  async verifyAdminOTP(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "All fields are required"
        });
      }

      const admin = await adminModel.findOne({ user_email: email }); // ✅ FIX

      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Invalid email"
        });
      }

      const checkOTP = await otpModel.findOne({
        userId: admin._id,
        otp
      });

      if (!checkOTP) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP"
        });
      }

      admin.isVerified = true;
      await admin.save();

      await otpModel.deleteMany({ userId: admin._id });

      return res.json({
        success: true,
        message: "Email verified successfully"
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }


  // ================= RESEND OTP =================

  async adminResendOTP(req, res) {
    try {
      const { email } = req.body;

      const admin = await adminModel.findOne({ user_email: email });

      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Invalid email"
        });
      }

      const otp = generateOTP();

      await otpModel.create({
        userId: admin._id,
        otp
      });

      await sendOTPMails({
        user: admin,
        otp,
        type: "resendOTP"
      });

      return res.json({
        success: true,
        message: "OTP sent again"
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }


  // ================= UPDATE PASSWORD =================

  async updateAdminPassword(req, res) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const adminId = req.user.user_id;

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: "Passwords do not match"
        });
      }

      const admin = await adminModel.findById(adminId);

      const isMatch = await bcrypt.compare(oldPassword, admin.user_password); // ✅ FIX

      if (!isMatch) {
        return res.status(400).json({
          message: "Old password wrong"
        });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      admin.user_password = hashed;
      await admin.save();

      await sendOTPMails({ user: admin, type: "updatePassword" });

      return res.json({
        success: true,
        message: "Password updated successfully"
      });

    } catch (error) {
      return res.status(500).json({
        message: error.message
      });
    }
  }


  // ================= BLOCK =================

  async blockUnblockAdmin(req, res) {
    try {
      const adminId = req.params.id;
      const requestingAdminId = req.user?.user_id;

      // Security: prevent self-blocking
      if (adminId === String(requestingAdminId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "You cannot block your own account"
        });
      }

      const admin = await adminModel.findById(adminId);

      if (!admin) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Admin not found"
        });
      }

      admin.isBlocked = !admin.isBlocked;
      await admin.save();

      return res.json({
        success: true,
        message: `Admin ${admin.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        isBlocked: admin.isBlocked
      });

    } catch (error) {
      return res.status(500).json({
        message: error.message
      });
    }
  }

}

module.exports = new AdminController();