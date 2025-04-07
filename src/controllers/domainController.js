// controllers/domainController.js
const { Domain, Mailbox, Alias, DOMAIN_STATUS } = require("../models");
const postfixUtil = require('../utils/postfixUtil');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const dns = require('dns').promises;
const os = require('os');
const { Op } = require('sequelize');

// Thêm hoặc cập nhật domain
// Nếu chưa có domain chính, đặt domain này làm domain chính
// Sau khi thêm, tự động áp dụng cấu hình mới nhất
exports.addDomain = async (req, res) => {
    const { name } = req.body;

    try {
        // Kiểm tra domain đã tồn tại chưa
        let domain = await Domain.findOne({ where: { name } });

        if (domain) {
            // Cập nhật domain đã tồn tại
            await domain.update({
                status: DOMAIN_STATUS.ACTIVE,
                updatedAt: new Date()
            });

            // Cập nhật cấu hình Postfix nếu là domain chính
            if (domain.is_primary) {
                await applyPostfixConfig(name);
            } else {
                // Nếu không phải domain chính, vẫn áp dụng cấu hình virtual domains
                await applyVirtualDomainsConfig();
            }

            return res.status(200).json({
                status: 1,
                message: "Domain updated successfully",
                data: domain
            });
        }

        // Kiểm tra xem domain này có nên là domain chính không
        const existingPrimary = await Domain.findOne({ where: { is_primary: true } });
        const is_primary = !existingPrimary;

        // Tạo domain mới
        domain = await Domain.create({
            name,
            is_primary,
            status: DOMAIN_STATUS.ACTIVE
        });

        // Kiểm tra và lưu trữ trạng thái DNS
        const dnsHealth = await checkDNSConfiguration(name);
        await domain.update({
            dns_status: dnsHealth
        });

        // Tự động áp dụng cấu hình
        if (is_primary) {
            // Nếu là domain chính, áp dụng cấu hình chính
            await applyPostfixConfig(name);
        } else {
            // Áp dụng cấu hình virtual domains
            await applyVirtualDomainsConfig();
        }

        // Tạo thư mục cho domain
        await createDomainDirectory(name);

        res.status(201).json({
            status: 1,
            message: "Domain added successfully",
            data: {
                domain,
                is_primary,
                dns_health: dnsHealth,
                config_applied: true
            }
        });

    } catch (err) {
        console.error("Error adding domain:", err);
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Lấy tất cả domains
exports.getDomains = async (req, res) => {
    try {
        const domains = await Domain.findAll({
            order: [['is_primary', 'DESC'], ['name', 'ASC']]
        });

        res.status(200).json({
            status: 1,
            message: "Domains retrieved successfully",
            data: domains
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Lấy chi tiết domain kèm mailboxes và aliases
exports.getDomainDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const domain = await Domain.findByPk(id, {
            include: [
                { model: Mailbox },
                { model: Alias }
            ]
        });

        if (!domain) {
            return res.status(404).json({
                status: 0,
                message: "Domain not found",
                data: null
            });
        }

        // Cập nhật trạng thái DNS
        const dnsHealth = await checkDNSConfiguration(domain.name);
        await domain.update({
            dns_status: dnsHealth
        });

        res.status(200).json({
            status: 1,
            message: "Domain details retrieved successfully",
            data: domain
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Xóa domain
exports.deleteDomain = async (req, res) => {
    const { id } = req.params;

    try {
        const domain = await Domain.findByPk(id);

        if (!domain) {
            return res.status(404).json({
                status: 0,
                message: "Domain not found",
                data: null
            });
        }

        // Kiểm tra xem có phải domain chính không
        if (domain.is_primary) {
            return res.status(400).json({
                status: 0,
                message: "Cannot delete primary domain",
                data: null
            });
        }

        // Lưu tên domain để xóa thư mục sau khi xóa bản ghi
        const domainName = domain.name;

        // Xóa domain (cascade đến mailboxes và aliases)
        await domain.destroy();

        // Cập nhật và áp dụng cấu hình (vì xóa domain yêu cầu cập nhật cấu hình)
        await applyVirtualDomainsConfig();

        // Xóa thư mục domain (không bắt buộc)
        try {
            await execPromise(`sudo rm -rf /var/mail/vhosts/${domainName}`);
        } catch (error) {
            console.error(`Could not remove domain directory: ${error.message}`);
            // Tiếp tục ngay cả khi không thể xóa thư mục
        }

        res.status(200).json({
            status: 1,
            message: "Domain deleted successfully",
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

// Đặt domain làm domain chính
exports.setPrimaryDomain = async (req, res) => {
    const { id } = req.params;

    try {
        // Tìm domain cần đặt làm chính
        const domain = await Domain.findByPk(id);

        if (!domain) {
            return res.status(404).json({
                status: 0,
                message: "Domain not found",
                data: null
            });
        }

        // Tìm domain chính hiện tại (nếu có) và bỏ cờ is_primary
        await Domain.update(
            { is_primary: false },
            { where: { is_primary: true } }
        );

        // Đặt domain mới làm chính
        await domain.update({ is_primary: true });

        // Áp dụng cấu hình với domain chính mới
        await applyPostfixConfig(domain.name);

        res.status(200).json({
            status: 1,
            message: "Primary domain set successfully",
            data: domain
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

// Tạo thư mục cho domain
async function createDomainDirectory(domainName) {
    try {
        // Đảm bảo thư mục gốc đã tồn tại
        await execPromise(`sudo mkdir -p /var/mail/vhosts`);

        // Tạo thư mục cho domain
        await execPromise(`sudo mkdir -p /var/mail/vhosts/${domainName}`);

        // Đảm bảo đã tồn tại user và group vmail
        await execPromise(`sudo groupadd -g 5000 vmail 2>/dev/null || true`);
        await execPromise(`sudo useradd -u 5000 -g vmail -s /usr/sbin/nologin -d /var/mail/vhosts vmail 2>/dev/null || true`);

        // Cấp quyền cho thư mục
        await execPromise(`sudo chown -R vmail:vmail /var/mail/vhosts`);

        return true;
    } catch (error) {
        console.error(`Error creating domain directory: ${error.message}`);
        // Không throw lỗi vì đây không phải là vấn đề nghiêm trọng
        return false;
    }
}

// Hàm helper
async function checkDNSConfiguration(domain) {
    try {
        // Sử dụng hàm từ postfixUtil
        return await postfixUtil.checkDNSConfiguration(domain);
    } catch (err) {
        console.error(`Error checking DNS for ${domain}:`, err);
        return {
            domain,
            error: err.message,
            healthScore: 0,
            timestamp: new Date().toISOString()
        };
    }
}

// Lấy địa chỉ IP của server
function getServerIP() {
    try {
        return postfixUtil.getServerIP();
    } catch (err) {
        console.error('Error getting server IP:', err);
        return '127.0.0.1';
    }
}

// Áp dụng cấu hình Postfix cho một domain cụ thể
async function applyPostfixConfig(domain) {
    try {
        // Tạo cấu hình Postfix
        const mainCfContent = await postfixUtil.generatePostfixConfig(domain);

        // Ghi vào file tạm
        const fs = require('fs');
        const path = require('path');
        const tempConfigFile = path.join('/tmp', `postfix_config_${Date.now()}`);
        fs.writeFileSync(tempConfigFile, mainCfContent);

        // Áp dụng cấu hình
        await execPromise(`sudo cp ${tempConfigFile} /etc/postfix/main.cf`);
        await execPromise(`sudo postfix reload`);

        // Xóa file tạm
        fs.unlinkSync(tempConfigFile);

        return {
            success: true,
            message: "Postfix configuration applied successfully"
        };
    } catch (err) {
        console.error('Error applying Postfix configuration:', err);
        return {
            success: false,
            error: err.message
        };
    }
}

// Áp dụng cấu hình virtual domains
async function applyVirtualDomainsConfig() {
    try {
        // Sử dụng hàm từ postfixUtil
        return await postfixUtil.applyConfiguration();
    } catch (err) {
        console.error('Error applying virtual domains configuration:', err);
        return {
            success: false,
            error: err.message
        };
    }
}

// Tạo DKIM key cho domain
exports.generateDKIMKeys = async (req, res) => {
    const { id } = req.params;

    try {
        const domain = await Domain.findByPk(id);

        if (!domain) {
            return res.status(404).json({
                status: 0,
                message: "Domain not found",
                data: null
            });
        }

        // Tạo DKIM keys
        const { privateKey, publicKey } = await generateDKIMKeyPair();

        // Cập nhật domain với DKIM keys
        const dkimSelector = `mail${Date.now()}`;
        await domain.update({
            dkimSelector: dkimSelector,
            dkimPrivateKey: privateKey,
            dkimPublicKey: publicKey
        });

        // Định dạng DKIM DNS record
        const dkimRecord = formatDKIMDNSRecord(publicKey);

        res.status(200).json({
            status: 1,
            message: "DKIM keys generated successfully",
            data: {
                selector: dkimSelector,
                dns_record: {
                    host: `${dkimSelector}._domainkey.${domain.name}`,
                    type: 'TXT',
                    value: dkimRecord
                }
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error generating DKIM keys",
            data: null
        });
    }
};

// Tạo cặp khóa DKIM
async function generateDKIMKeyPair() {
    try {
        const crypto = require('crypto');

        // Tạo RSA key pair
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        return { privateKey, publicKey };
    } catch (error) {
        console.error('Error generating DKIM keys:', error);
        throw error;
    }
}

// Định dạng DKIM public key cho bản ghi DNS
function formatDKIMDNSRecord(publicKey) {
    // Trích xuất phần body của public key (loại bỏ header và footer)
    const keyBody = publicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s+/g, '');

    // Định dạng bản ghi DNS
    return `v=DKIM1; k=rsa; p=${keyBody}`;
}
exports.exportDNSConfig = async (req, res) => {
    const { id } = req.params;

    try {
        const { publicKey,privateKey } = await generateDKIMKeyPair();
        const domain = await Domain.findByPk(id);

        if (!domain) {
            return res.status(404).json({
                status: 0,
                message: "Domain not found",
                data: null
            });
        }

        // Lấy IP máy chủ
        const serverIP = getServerIP();
        const domainName = domain.name;

        // Lấy DKIM public key nếu có
        let dkimRecord = null;
        if (publicKey) {
            dkimRecord = formatDKIMDNSRecord(publicKey);
        }

        // Tạo danh sách các bản ghi DNS cần thiết
        const dnsRecords = [
            // MX Record - Ưu tiên nhận mail
            {
                type: "MX",
                name: "@",
                content: `mail.${domainName}`,
                priority: 10,
                ttl: 3600,
                proxied: false,
                note: "Bản ghi MX định hướng email đến máy chủ mail của bạn"
            },

            // A Record - Trỏ mail subdomain đến IP máy chủ
            {
                type: "A",
                name: "mail",
                content: serverIP,
                ttl: 3600,
                proxied: false,
                note: "Trỏ subdomain 'mail' đến địa chỉ IP của máy chủ mail"
            },

            // SPF Record - Xác thực máy chủ được phép gửi email
            {
                type: "TXT",
                name: "@",
                content: `v=spf1 mx a ip4:${serverIP} ~all`,
                ttl: 3600,
                proxied: false,
                note: "SPF Record xác định những máy chủ được phép gửi email từ domain này"
            },

            // DMARC Record - Chính sách xử lý email không vượt qua kiểm tra
            {
                type: "TXT",
                name: "_dmarc",
                content: `v=DMARC1; p=none; rua=mailto:postmaster@${domainName}`,
                ttl: 3600,
                proxied: false,
                note: "DMARC Record chỉ định chính sách xử lý email không vượt qua xác thực SPF/DKIM"
            }
        ];
        
        const dkimSelector = `mail${Date.now()}`;
        // Thêm DKIM record nếu có
        if (dkimRecord) {
            dnsRecords.push({
                type: "TXT",
                name: `${dkimSelector}._domainkey`,
                content: dkimRecord,
                ttl: 3600,
                proxied: false,
                note: "DKIM Record dùng để ký số và xác thực email gửi đi"
            });
        } else {
            // Thêm hướng dẫn tạo DKIM nếu chưa có
            dnsRecords.push({
                type: "TXT",
                name: `default._domainkey`,
                content: "Chưa cấu hình DKIM. Vui lòng tạo khóa DKIM trước.",
                ttl: 3600,
                proxied: false,
                note: "Bạn cần tạo DKIM key trước khi cấu hình bản ghi này"
            });
        }

        // Thêm bản ghi PTR (nếu có quyền cấu hình)
        const ptrNote = {
            type: "PTR",
            name: `${serverIP}`,
            content: `mail.${domainName}`,
            note: "Bản ghi PTR (Reverse DNS) cần được cấu hình tại nhà cung cấp hosting hoặc ISP, không phải trong Cloudflare"
        };

        res.status(200).json({
            status: 1,
            message: "DNS records exported successfully",
            data: {
                domain: domainName,
                server_ip: serverIP,
                dns_records: dnsRecords,
                ptr_note: ptrNote,
                cloudflare_instructions: "Đăng nhập vào Cloudflare, chọn domain của bạn, và thêm các bản ghi DNS như trên. Đặc biệt lưu ý bản ghi PTR cần phải được cấu hình bởi nhà cung cấp hosting của bạn."
            }
        });
    } catch (err) {
        console.error("Error exporting DNS config:", err);
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};