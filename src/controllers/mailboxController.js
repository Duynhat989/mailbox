// controllers/mailboxController.js
const { Domain, Mailbox, DOMAIN_STATUS } = require("../models");
const { encryption, compare } = require('../utils/encode.js');
const { createNewToken } = require('../middlewares/manageToken');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { Op } = require('sequelize');

// Create a new mailbox for a domain
exports.createMailbox = async (req, res) => {
    const { domain_id, username, password, quota } = req.body;
    // Find the domain

    try {
        const domain = await Domain.findByPk(domain_id);

        if (!domain) {
            return res.status(404).json({
                status: 0,
                message: "Domain not found",
                data: null
            });
        }

        // Create email address
        const email = `${username}@${domain.name}`;

        // Check if email already exists
        const existingMailbox = await Mailbox.findOne({ where: { email } });

        if (existingMailbox) {
            return res.status(400).json({
                status: 0,
                message: "Email address already exists",
                data: null
            });
        }

        // Encrypt password
        const hashedPassword = await encryption(password);

        // Create the mailbox
        const mailbox = await Mailbox.create({
            email,
            username,
            password: hashedPassword,
            domain_id,
            quota: quota || 1024, // Default 1GB
            status: DOMAIN_STATUS.ACTIVE
        });

        // Apply configuration changes
        try {
            await applyVirtualDomainsConfig();
        } catch (error) {
            console.error('Error applying virtual domains configuration:', error);
            return res.status(500).json({
                status: 0,
                message: "Error applying configuration",
                data: null
            });
        }

        // Create mailbox directory
        // try {
        //     await execPromise(`sudo mkdir -p /var/mail/vhosts/${domain.name}/${username}`);
        //     await execPromise(`sudo chown -R vmail:vmail /var/mail/vhosts/${domain.name}/${username}`);
        // } catch (err) {
        //     console.error(`Error creating mailbox directory: ${err.message}`);
        //     // Continue even if directory creation fails
        // }

        const token = createNewToken({
            id: mailbox.id,
            email: mailbox.email,
            username: mailbox.username,
            domain: domain.name
        });
        res.status(201).json({
            status: 1,
            message: "Mailbox created successfully",
            data: {
                id: mailbox.id,
                email: mailbox.email,
                username: mailbox.username,
                token,
                domain: domain.name
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Get all mailboxes
exports.getAllMailboxes = async (req, res) => {
    try {
        const mailboxes = await Mailbox.findAll({
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Domain,
                    attributes: ['name', 'is_primary', 'status']
                }
            ]
        });

        res.status(200).json({
            status: 1,
            message: "Mailboxes retrieved successfully",
            data: mailboxes
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Get mailboxes for a specific domain
exports.getDomainMailboxes = async (req, res) => {
    const { domain_id } = req.params;

    try {
        // Check if domain exists
        const domain = await Domain.findByPk(domain_id);

        if (!domain) {
            return res.status(404).json({
                status: 0,
                message: "Domain not found",
                data: null
            });
        }

        // Get all mailboxes for the domain
        const mailboxes = await Mailbox.findAll({
            where: { domain_id },
            attributes: { exclude: ['password'] } // Don't return password hashes
        });

        res.status(200).json({
            status: 1,
            message: "Mailboxes retrieved successfully",
            data: {
                domain: domain.name,
                mailboxes
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Get mailbox by ID
exports.getMailbox = async (req, res) => {
    const { id } = req.params;

    try {
        const mailbox = await Mailbox.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Domain,
                    attributes: ['name', 'is_primary', 'status']
                }
            ]
        });

        if (!mailbox) {
            return res.status(404).json({
                status: 0,
                message: "Mailbox not found",
                data: null
            });
        }

        res.status(200).json({
            status: 1,
            message: "Mailbox retrieved successfully",
            data: mailbox
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Update mailbox
exports.updateMailbox = async (req, res) => {
    const { id } = req.params;
    const { password, quota, status } = req.body;

    try {
        // Find mailbox
        const mailbox = await Mailbox.findByPk(id);

        if (!mailbox) {
            return res.status(404).json({
                status: 0,
                message: "Mailbox not found",
                data: null
            });
        }

        // Update fields
        const updates = {};

        if (password) {
            updates.password = await encryption(password);
        }

        if (quota) {
            updates.quota = quota;
        }

        if (status !== undefined) {
            updates.status = status;
        }

        // Apply updates
        await mailbox.update(updates);

        // If status changed, apply configuration
        if (status !== undefined) {
            await applyVirtualDomainsConfig();
        }

        res.status(200).json({
            status: 1,
            message: "Mailbox updated successfully",
            data: {
                id: mailbox.id,
                email: mailbox.email,
                username: mailbox.username,
                quota: mailbox.quota,
                status: mailbox.status
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Delete mailbox
exports.deleteMailbox = async (req, res) => {
    const { id } = req.params;

    try {
        const mailbox = await Mailbox.findByPk(id, {
            include: [{ model: Domain }]
        });

        if (!mailbox) {
            return res.status(404).json({
                status: 0,
                message: "Mailbox not found",
                data: null
            });
        }

        // Get domain and username for directory removal
        const domainName = mailbox.Domain.name;
        const username = mailbox.username;

        // Delete mailbox
        await mailbox.destroy();

        // Apply configuration changes
        await applyVirtualDomainsConfig();

        // Try to remove mailbox directory (non-critical)
        try {
            await execPromise(`sudo rm -rf /var/mail/vhosts/${domainName}/${username}`);
        } catch (err) {
            console.error(`Error removing mailbox directory: ${err.message}`);
            // Continue even if directory removal fails
        }

        res.status(200).json({
            status: 1,
            message: "Mailbox deleted successfully",
            data: null
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Authenticate mailbox (for IMAP/POP3/SMTP)
exports.authenticateMailbox = async (req, res) => {
    const { email, password } = req.body;

    try {
        const mailbox = await Mailbox.findOne({
            where: {
                email,
                status: DOMAIN_STATUS.ACTIVE
            },
            include: [{
                model: Domain,
                where: { status: DOMAIN_STATUS.ACTIVE }
            }]
        });

        if (!mailbox) {
            return res.status(401).json({
                status: 0,
                message: "Authentication failed",
                data: null
            });
        }

        // Check password
        const passwordValid = await compare(password, mailbox.password);

        if (!passwordValid) {
            return res.status(401).json({
                status: 0,
                message: "Authentication failed",
                data: null
            });
        }

        res.status(200).json({
            status: 1,
            message: "Authentication successful",
            data: {
                id: mailbox.id,
                email: mailbox.email,
                username: mailbox.username,
                domain: mailbox.Domain.name
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Apply virtual domains configuration
async function applyVirtualDomainsConfig() {
    try {
        // Get all active domains with their mailboxes
        const domains = await Domain.findAll({
            where: { status: DOMAIN_STATUS.ACTIVE },
            include: [
                {
                    model: Mailbox,
                    where: { status: DOMAIN_STATUS.ACTIVE },
                    required: false
                }
            ]
        });

        // Create virtual mailboxes mapping
        let virtualMailboxes = '';
        domains.forEach(domain => {
            if (domain.Mailboxes && domain.Mailboxes.length > 0) {
                domain.Mailboxes.forEach(mailbox => {
                    virtualMailboxes += `${mailbox.email} ${domain.name}/${mailbox.username}/\n`;
                });
            }
        });

        // Write to virtual_mailbox_maps file
        const fs = require('fs');
        const path = require('path');
        const tempFile = path.join('/tmp', `virtual_mailbox_maps_${Date.now()}`);

        fs.writeFileSync(tempFile, virtualMailboxes);

        // Update Postfix maps
        await execPromise(`sudo cp ${tempFile} /etc/postfix/virtual_mailbox_maps`);
        await execPromise(`sudo postmap /etc/postfix/virtual_mailbox_maps`);
        await execPromise(`sudo postfix reload`);

        // Clean up
        fs.unlinkSync(tempFile);

        return {
            success: true,
            message: "Virtual mailboxes configuration applied"
        };
    } catch (err) {
        console.error('Error applying virtual mailboxes configuration:', err);
        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = exports;