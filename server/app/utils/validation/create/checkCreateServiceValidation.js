const JOI = require("joi");

const checkCreateServiceValidate = JOI.object({
    service_name: JOI.string().required(),
    service_description: JOI.string().min(40).max(150).required()
});

module.exports = checkCreateServiceValidate;