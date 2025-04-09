// controllers/mailboxController.js
const { Domain, Mailbox, DOMAIN_STATUS, Message } = require("../models");
const { encryption, compare } = require('../utils/encode.js');
const { createNewToken, getPayloadToken } = require('../middlewares/manageToken');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { Op } = require('sequelize');

// Create a new mailbox for a domain
exports.getMessageAll = async (req, res) => {
    
    try {
        const userId = req.user.id;
    const { mailboxId } = req.params;
    const confirmD = await Mailbox.findByPk(mailboxId)
    if (!confirmD || confirmD.user_id != userId) {
        return res.status(599).json({
            success: false,
            message: "not found",
            data: []
        });
    }
    const msg = await Message.findAll({
        where: {
            mailbox_id: mailboxId
        },
        attributes: [
            "id",
            "messageId",
            "fromEmail",
            "toEmail",
            "subject",
            "read",
            "textContent",
            "htmlContent",
            "createdAt"
        ],
        order: [["createdAt", "DESC"]], // Sắp theo thời gian mới nhất
        limit: 20
    })
    if (msg) {
        return res.status(200).json({
            success: true,
            data: msg
        });
    } else {
        return res.status(404).json({
            success: false,
            data: []
        });
    }
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};
exports.getMessage = async (req, res) => {
    const { messageId } = req.params;
    try {
        const msg = await Message.findAll({
            where: {
                messageId: messageId
            },
            attributes: [
                "id",
                "messageId",
                "fromEmail",
                "toEmail",
                "textContent",
                "htmlContent",
                "createdAt"
            ]
        })
        if (msg) {
            res.status(200).json({
                success: true,
                data: msg
            });
        } else {
            res.status(404).json({
                success: false,
                data: []
            });
        }
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};
exports.readMessage = async (req, res) => {
    const { messageId } = req.params;
    try {
        // Find the message in the database
        const msg = await Message.findOne({
            where: {
                messageId: messageId
            }
        });

        if (msg) {
            // Mark the message as read
            msg.read = true;
            // Save the updated message to the database
            await msg.save();

            return res.status(200).json({
                success: true
            });
        } else {
            return res.status(404).json({
                success: false
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error occurred",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = exports;