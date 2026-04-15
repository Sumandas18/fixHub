const StatusCode = require("../utils/statusCode");
const contactModel = require("../models/contactModel");
const checkContactValidation = require("../utils/validation/checkContactValidation");
const { generatecontactId } = require("../utils/credentials/generateCredential");
const sendOTPMails = require("../utils/sendMail");

class ContactController {

    async createContact(req, res) {
        try {
            const { name, email, subject, message } = req.body;

            const contactId = await generatecontactId();

            if (!name || !email || !subject || !message) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            const { data, error } = checkContactValidation.validate({ contactId, name, email, subject, message });

            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            const contactObj = new contactModel({ name, email, subject, message });

            const contact = await contactObj.save();
            sendOTPMails({ contact, type: "messageReceived" }).catch(console.error);

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Message posted successfully. We will reach you soon",
                data: contact
            });
        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getAllContactMessage(req, res) {
        try {
            let contact;
            const messageStatus = req.params.status;

            if (messageStatus == "completed") {
                contact = await contactModel.find({ status: "completed" });
            }
            else if (messageStatus == "rejected") {
                contact = await contactModel.find({ status: "rejected" });
            }
            else if (messageStatus == "all") {
                contact = await contactModel.find();
            }
            else {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: true,
                    message: "Invalid status"
                });
            }

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "All available contact",
                count: contact.length,
                data: contact
            });
        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getSpecificContactMessage(req, res) {
        try {

            const messageId = req.params.messageId;

            if (!messageId) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Contact ID is required"
                })
            }

            const contact = await contactModel.findById(messageId);

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Fetch contact message",
                data: contact
            });
        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async addComment(req, res) {
        try {
            const messageId = req.params.messageId;
            const auth = req.user;

            if (!messageId) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Contact ID is required"
                })
            }

            if (!auth || auth.user_role != 'admin') {
                return res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: "Unauthorised access"
                });
            }

            const existMessage = await contactModel.findById(messageId);

            if (!existMessage) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Invalid contact"
                })
            }

            const message = await contactModel.findByIdAndUpdate(messageId, req.body, { new: true });

            existMessage.status = 'completed';
            await existMessage.save();
            sendOTPMails({ contact: { ...existMessage.toObject(), reply: req.body.reply }, type: "replySent" }).catch(console.error);

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Reply submitted successfully"
            });
        }
        catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async denyComment(req, res) {
        try {
            const messageId = req.params.messageId;

            if (!messageId) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Contact ID is required"
                })
            }

            const existMessage = await contactModel.findById(messageId);

            if (!existMessage) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Invalid contact"
                })
            }

            existMessage.status = "rejected";
            await existMessage.save();

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Message denied successfully"
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

module.exports = new ContactController();
