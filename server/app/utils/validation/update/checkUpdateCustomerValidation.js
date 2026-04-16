const JOI = require("joi");

const addressUpdateSchema = JOI.object({
    houseOrFlatNo: JOI.string().min(1),
    buildingName: JOI.string().allow("", null),
    street: JOI.string().min(2),
    area: JOI.string().min(2),
    landmark: JOI.string().allow("", null),
    city: JOI.string().min(2),
    district: JOI.string().allow("", null),
    state: JOI.string().min(2),
    pinCode: JOI.string()
        .pattern(/^[0-9]{6}$/)
        .messages({
            "string.pattern.base": "PIN code must be exactly 6 digits"
        }),
    country: JOI.string()
}).min(1);

const checkCustomerUpdateValidate = JOI.object({

    user_name: JOI.string().min(2).messages({
        "string.min": "Name must be at least 2 characters"
    }),

    user_contact: JOI.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
            "string.pattern.base": "Contact must be a 10-digit number"
        }),

    user_address: addressUpdateSchema
}).min(1);

module.exports = checkCustomerUpdateValidate;