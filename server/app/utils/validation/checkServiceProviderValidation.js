const JOI = require("joi");

const serviceProviderValidation = JOI.object({
    service_area_zip: JOI.array().items(JOI.string().pattern(/^[0-9]{6}$/).message("Each ZIP code must be 6 digits"))
        .min(1).required(),
    experience: JOI.string().max(50).required(),
    charges_per_hour: JOI.string().pattern(/^[0-9]+$/).message("Charges must be numeric").required()
});

module.exports = serviceProviderValidation;