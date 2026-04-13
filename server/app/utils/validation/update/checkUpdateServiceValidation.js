const JOI = require("joi");

const checkUpdateServiceValidate = JOI.object({
    service_name: JOI.string().min(3).max(50),
    service_description: JOI.string().min(5).max(500)
}).min(1).messages({
    "object.min": "At least one field is required for update"
});

module.exports = checkUpdateServiceValidate;