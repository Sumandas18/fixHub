const JOI = require("joi");

const updateServiceProviderValidate = JOI.object({
    service_area_zip: JOI.string().optional(),
    experience: JOI.alternatives().try(JOI.string(), JOI.number()).optional(),
    charges_per_hour: JOI.alternatives().try(JOI.string(), JOI.number()).optional(),
    service_name: JOI.string().optional(),
    service_description: JOI.string().min(40).max(150).optional()
}).min(1);

module.exports = updateServiceProviderValidate;