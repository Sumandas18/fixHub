const StatusCode = require("../utils/statusCode");
const serviceModel = require("../models/serviceModel");

class ServiceController {
  async createService(req, res) {
    try {
      const service = await serviceModel.create({
        ...req.body,
        service_image: req.file?.path || "image.png",
      });

      return res.status(StatusCode.CREATED).json({
        success: true,
        data: service,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAll(req, res) {
    const data = await serviceModel.find();
    return res.status(200).json({ success: true, data });
  }

  async getOne(req, res) {
    const data = await serviceModel.findById(req.params.id);
    return res.json({ success: true, data });
  }

  async update(req, res) {
    const data = await serviceModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.json({ success: true, data });
  }

  async delete(req, res) {
    await serviceModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Deleted" });
  }
}

module.exports = new ServiceController();
