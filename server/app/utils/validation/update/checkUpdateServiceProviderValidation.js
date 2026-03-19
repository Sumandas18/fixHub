const JOI = require("joi");

const updateServiceValidate = JOI.object({
    service_name: JOI.string().optional(),
    service_description: JOI.string().min(40).max(150).optional()
}).min(1); 

module.exports = updateServiceValidate;