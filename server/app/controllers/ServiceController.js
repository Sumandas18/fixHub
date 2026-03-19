const cloudinary = require("cloudinary");

const StatusCode = require("../utils/statusCode");
const serviceModel = require("../models/serviceModel");
const checkServiceValidate = require("../utils/validation/create/checkCreateServiceValidation");
const checkUpdateServiceValidate = require("../utils/validation/update/checkUpdateServiceValidation");

class ServiceController {

  async createService(req, res) {
    try {
      let service_image, service_image_url, serviceObj;
      const { service_name, service_description } = req.body;

      if (!service_name || !service_description) {
        return res.status(StatusCode.BAD_GATEWAY).json({
          success: false,
          message: "All fields are required"
        });
      }

      const { data, error } = checkServiceValidate.validate({ service_name, service_description });

      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details.map(err => err.message)
        });
      }

      serviceObj = new serviceModel({ service_name, service_description });

      if (req.file) {
        service_image = req.file.filename;
        service_image_url = req.file.path;

        serviceObj = { ...serviceObj, service_image, service_image_url }
      }

      const service = await serviceObj.save();

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Service created successfully",
        data: service
      });
    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllService(req, res) {
    try {
      const services = await serviceModel.find();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "All available services",
        data: services
      });
    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getOneService(req, res) {
    try {
      const serviceId = req.params.id;

      if (!serviceId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Service ID is required"
        })
      }
      const service = await serviceModel.findById(serviceId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Single service details",
        data: service
      });
    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateService(req, res) {
    try {
      let service_image, service_image_url, serviceObj = req.body;
      const serviceId = req.params.id;

      if (!serviceId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Service ID is required"
        })
      }

      const { data, error } = checkUpdateServiceValidate.validate(serviceObj);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details.map(err => err.message)
        });
      }

      const service = await serviceModel.findById(serviceId);

      if (req.file) {
        await cloudinary.uploader.destroy(service.service_image);

        service_image = req.file.filename;
        service_image_url = req.file.path;

        serviceObj = { ...serviceObj, service_image, service_image_url };
      }

      const updateService = await serviceModel.findByIdAndUpdate(serviceId, serviceObj, { new: true });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Service updated successfully"
      });
    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async toggleService(req, res) {
    try {
      const serviceId = req.params.id;

      if (!serviceId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Service ID is required"
        });
      }

      const service = await serviceModel.findById(serviceId);

      if (!service) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Service not available"
        });
      }

      service.is_active = !service.is_active;
      await service.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `Service ${service.is_active ? "activated" : "deactivated"}`
      });

    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteService(req, res) {
    try {
      const serviceId = req.params.id;

      if (!serviceId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Service ID is required"
        });
      }

      const service = await serviceModel.findById(serviceId);

      if (!service) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Service not available"
        });
      }

      await cloudinary.uploader.destroy(service.service_image);
      await serviceModel.findByIdAndDelete(serviceId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Service deleted successfully"
      });
    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ServiceController();
