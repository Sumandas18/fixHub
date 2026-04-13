const JOI = require("joi");

const checkCreateServiceValidate = JOI.object({
    service_name: JOI.string().required(),
    service_description: JOI.string().min(5).max(500).required()
});

module.exports = checkCreateServiceValidate;