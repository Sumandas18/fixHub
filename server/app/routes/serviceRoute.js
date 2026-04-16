const express = require("express");

const serviceController = require("./../controllers/ServiceController");
const UploadService = require("../utils/upload/uploadServiceImg");

const userAuthCheck = require("../middleware/userAuthCheck");


const Router = express.Router();

Router.post("/add", userAuthCheck(["admin"]), UploadService.single("service-img"), serviceController.createService);
Router.get("/", serviceController.getAllService);
Router.get("/:id", serviceController.getOneService);
Router.put("/status/:id", userAuthCheck(["admin"]), serviceController.toggleService);
Router.patch("/status/:id", userAuthCheck(["admin"]), serviceController.setServiceStatus);
Router.put("/update/:id", userAuthCheck(["admin"]), UploadService.single("service-img"), serviceController.updateService);
Router.delete("/delete/:id", userAuthCheck(["admin"]), serviceController.deleteService);

module.exports = Router;