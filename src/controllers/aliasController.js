// controllers/aliasController.js
const { Domain, Alias, Mailbox, DOMAIN_STATUS } = require("../models");
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { Op } = require('sequelize');

// Create a new alias for a domain
exports.createAlias = async (req, res) => {
    const { domain_id, alias, destination } = req.body;

    try {
        // Find the domain
        const domain = await Domain.findByPk(domain_id);

        if (!domain) {
            return res.status(404).json({
                status: 0,
                message: "Domain not found",
                data: null
            });
        }

        // Check if alias already contains @ symbol
        let fullAlias = alias;
        if (!alias.includes('@')) {
            fullAlias = `${alias}@${domain.name}`;
        }

        // Check if alias already exists
        const existingAlias = await Alias.findOne({ where: { alias: fullAlias } });

        if (existingAlias) {
            return res.status(400).json({
                status: 0,
                message: "Alias already exists",
                data: null
            });
        }

        // Validate destination email
        if (!destination.includes('@')) {
            return res.status(400).json({
                status: 0,
                message: "Destination must be a full email address",
                data: null
            });
        }

        // Create the alias
        const newAlias = await Alias.create({
            alias: fullAlias,
            destination,
            domain_id,
            status: DOMAIN_STATUS.ACTIVE
        });

        // Apply configuration changes
        await applyVirtualAliasConfig();

        res.status(201).json({
            status: 1,
            message: "Alias created successfully",
            data: {
                id: newAlias.id,
                alias: newAlias.alias,
                destination: newAlias.destination,
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

// Get all aliases
exports.getAllAliases = async (req, res) => {
    try {
        const aliases = await Alias.findAll({
            include: [
                {
                    model: Domain,
                    attributes: ['name', 'is_primary', 'status']
                }
            ]
        });

        res.status(200).json({
            status: 1,
            message: "Aliases retrieved successfully",
            data: aliases
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Get aliases for a specific domain
exports.getDomainAliases = async (req, res) => {
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

        // Get all aliases for the domain
        const aliases = await Alias.findAll({
            where: { domain_id }
        });

        res.status(200).json({
            status: 1,
            message: "Aliases retrieved successfully",
            data: {
                domain: domain.name,
                aliases
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

// Get alias by ID
exports.getAlias = async (req, res) => {
    const { id } = req.params;

    try {
        const alias = await Alias.findByPk(id, {
            include: [
                {
                    model: Domain,
                    attributes: ['name', 'is_primary', 'status']
                }
            ]
        });

        if (!alias) {
            return res.status(404).json({
                status: 0,
                message: "Alias not found",
                data: null
            });
        }

        res.status(200).json({
            status: 1,
            message: "Alias retrieved successfully",
            data: alias
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Update alias
exports.updateAlias = async (req, res) => {
    const { id } = req.params;
    const { destination, status } = req.body;

    try {
        // Find alias
        const alias = await Alias.findByPk(id);

        if (!alias) {
            return res.status(404).json({
                status: 0,
                message: "Alias not found",
                data: null
            });
        }

        // Update fields
        const updates = {};

        if (destination) {
            // Validate destination email
            if (!destination.includes('@')) {
                return res.status(400).json({
                    status: 0,
                    message: "Destination must be a full email address",
                    data: null
                });
            }
            updates.destination = destination;
        }

        if (status !== undefined) {
            updates.status = status;
        }

        // Apply updates
        await alias.update(updates);

        // Apply configuration
        await applyVirtualAliasConfig();

        res.status(200).json({
            status: 1,
            message: "Alias updated successfully",
            data: {
                id: alias.id,
                alias: alias.alias,
                destination: alias.destination,
                status: alias.status
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

// Delete alias
exports.deleteAlias = async (req, res) => {
    const { id } = req.params;

    try {
        const alias = await Alias.findByPk(id);

        if (!alias) {
            return res.status(404).json({
                status: 0,
                message: "Alias not found",
                data: null
            });
        }

        // Delete alias
        await alias.destroy();

        // Apply configuration changes
        await applyVirtualAliasConfig();

        res.status(200).json({
            status: 1,
            message: "Alias deleted successfully",
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

// Apply virtual alias configuration
async function applyVirtualAliasConfig() {
    try {
        // Get all active domains with their aliases
        const domains = await Domain.findAll({
            where: { status: DOMAIN_STATUS.ACTIVE },
            include: [
                {
                    model: Alias,
                    where: { status: DOMAIN_STATUS.ACTIVE },
                    required: false
                }
            ]
        });

        // Create virtual aliases mapping
        let virtualAliases = '';
        domains.forEach(domain => {
            if (domain.Aliases && domain.Aliases.length > 0) {
                domain.Aliases.forEach(alias => {
                    virtualAliases += `${alias.alias} ${alias.destination}\n`;
                });
            }
        });

        // Write to virtual_alias_maps file
        const fs = require('fs');
        const path = require('path');
        const tempFile = path.join('/tmp', `virtual_alias_maps_${Date.now()}`);

        fs.writeFileSync(tempFile, virtualAliases);

        // Update Postfix maps
        await execPromise(`sudo cp ${tempFile} /etc/postfix/virtual_alias_maps`);
        await execPromise(`sudo postmap /etc/postfix/virtual_alias_maps`);
        await execPromise(`sudo postfix reload`);

        // Clean up
        fs.unlinkSync(tempFile);

        return {
            success: true,
            message: "Virtual aliases configuration applied"
        };
    } catch (err) {
        console.error('Error applying virtual aliases configuration:', err);
        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = exports;