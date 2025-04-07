// utils/postfixUtil.js
const { Domain, Mailbox, Alias, DOMAIN_STATUS } = require('../models');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const os = require('os');
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

/**
 * Check if Postfix is installed and get configuration status
 * @returns {Object} Information about the Postfix installation
 */
exports.checkPostfixInstalled = async () => {
  try {
    // Check if Postfix config files exist
    const postfixMainCfExists = fs.existsSync('/etc/postfix/main.cf');
    const postfixDirExists = fs.existsSync('/etc/postfix');
    
    if (postfixMainCfExists && postfixDirExists) {
      // Read some content to verify
      const mainCfContent = fs.readFileSync('/etc/postfix/main.cf', 'utf8');
      
      // Check if Postfix service is running
      try {
        const { stdout } = await execPromise('systemctl is-active postfix');
        const isActive = stdout.trim() === 'active';
        
        return {
          installed: true,
          running: isActive,
          configPresent: true,
          configPreview: mainCfContent.substring(0, 200) + '...' // First 200 chars
        };
      } catch (err) {
        return {
          installed: true,
          running: false,
          configPresent: true,
          error: 'Service not running or not using systemd'
        };
      }
    }
    
    return {
      installed: false,
      running: false,
      configPresent: false,
      error: 'Postfix configuration files not found'
    };
  } catch (err) {
    console.error('Error checking Postfix:', err);
    return {
      installed: false,
      error: err.message
    };
  }
};

/**
 * Get the server's public IP address
 * @returns {String} The server's public IPv4 address
 */
exports.getServerIP = () => {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  } catch (err) {
    console.error('Error getting server IP:', err);
    return '127.0.0.1';
  }
};

/**
 * Check DNS configuration for email-related records
 * @param {String} domain The domain to check
 * @returns {Object} Results of DNS checks with health score
 */
exports.checkDNSConfiguration = async (domain) => {
  try {
    const results = {
      domain,
      checks: {
        mx: { status: 'unchecked', records: [] },
        spf: { status: 'unchecked', records: [] },
        dkim: { status: 'unchecked', records: [] },
        dmarc: { status: 'unchecked', records: [] },
        ptr: { status: 'unchecked', records: [] }
      },
      timestamp: new Date().toISOString()
    };

    // Check MX records
    try {
      const mxRecords = await dns.resolveMx(domain);
      results.checks.mx.records = mxRecords;
      results.checks.mx.status = mxRecords.length > 0 ? 'ok' : 'missing';
    } catch (err) {
      results.checks.mx.status = 'error';
      results.checks.mx.error = err.code;
    }

    // Check SPF records
    try {
      const txtRecords = await dns.resolveTxt(domain);
      const spfRecords = txtRecords.filter(record => 
        record.join('').startsWith('v=spf1')
      );

      results.checks.spf.records = spfRecords.map(r => r.join(''));
      results.checks.spf.status = spfRecords.length > 0 ? 'ok' : 'missing';
    } catch (err) {
      results.checks.spf.status = 'error';
      results.checks.spf.error = err.code;
    }

    // Check DMARC records
    try {
      const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
      const validDmarc = dmarcRecords.filter(record =>
        record.join('').startsWith('v=DMARC1')
      );

      results.checks.dmarc.records = dmarcRecords.map(r => r.join(''));
      results.checks.dmarc.status = validDmarc.length > 0 ? 'ok' : 'missing';
    } catch (err) {
      if (err.code === 'ENOTFOUND') {
        results.checks.dmarc.status = 'missing';
      } else {
        results.checks.dmarc.status = 'error';
        results.checks.dmarc.error = err.code;
      }
    }

    // Check DKIM records with multiple common selectors
    try {
      const selectors = ['mail', 'default', 'dkim', 'selector1'];
      let dkimFound = false;

      for (const selector of selectors) {
        try {
          const dkimRecords = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
          if (dkimRecords.length > 0) {
            results.checks.dkim.records.push(...dkimRecords.map(r => r.join('')));
            dkimFound = true;
          }
        } catch (e) {
          // Continue checking other selectors
        }
      }

      results.checks.dkim.status = dkimFound ? 'ok' : 'missing';
    } catch (err) {
      results.checks.dkim.status = 'error';
      results.checks.dkim.error = err.code;
    }

    // Check PTR record (reverse DNS)
    try {
      const serverIP = exports.getServerIP();
      const ptrRecords = await dns.reverse(serverIP);
      results.checks.ptr.records = ptrRecords;
      results.checks.ptr.status = ptrRecords.length > 0 ? 'ok' : 'missing';
      
      // Check if PTR matches domain
      if (ptrRecords.length > 0) {
        const ptrMatchesDomain = ptrRecords.some(record => 
          record.endsWith(domain) || domain.endsWith(record.replace(/^[^.]+\./, ''))
        );
        results.checks.ptr.matches_domain = ptrMatchesDomain;
      }
    } catch (err) {
      results.checks.ptr.status = 'error';
      results.checks.ptr.error = err.code;
    }

    // Calculate DNS health score (percentage of passed checks)
    let totalChecks = 0;
    let passedChecks = 0;

    for (const [key, check] of Object.entries(results.checks)) {
      if (check.status !== 'unchecked') {
        totalChecks++;
        if (check.status === 'ok') {
          passedChecks++;
        }
      }
    }

    results.healthScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
    
    // Add recommendations based on missing records
    results.recommendations = [];
    
    if (results.checks.mx.status !== 'ok') {
      results.recommendations.push({
        type: 'mx',
        message: 'Add MX records pointing to your mail server',
        example: `${domain}. 3600 IN MX 10 mail.${domain}.`
      });
    }
    
    if (results.checks.spf.status !== 'ok') {
      results.recommendations.push({
        type: 'spf',
        message: 'Add SPF record to authorize mail servers',
        example: `${domain}. 3600 IN TXT "v=spf1 mx a ip4:${exports.getServerIP()} ~all"`
      });
    }
    
    if (results.checks.dkim.status !== 'ok') {
      results.recommendations.push({
        type: 'dkim',
        message: 'Set up DKIM signing and add the public key to DNS',
        example: `default._domainkey.${domain}. 3600 IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA..."`
      });
    }
    
    if (results.checks.dmarc.status !== 'ok') {
      results.recommendations.push({
        type: 'dmarc',
        message: 'Add DMARC policy record',
        example: `_dmarc.${domain}. 3600 IN TXT "v=DMARC1; p=none; rua=mailto:postmaster@${domain}"`
      });
    }

    return results;
  } catch (err) {
    console.error(`Error checking DNS for ${domain}:`, err);
    return {
      domain,
      error: err.message,
      healthScore: 0,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Check if port 25 is open and Postfix is listening
 * @returns {Object} Status of port 25
 */
exports.checkPort25 = async () => {
  try {
    // Check if port 25 is open
    const { stdout } = await execPromise('nc -z -v -w5 localhost 25 2>&1');
    const isOpen = stdout.includes('succeeded') || stdout.includes('open');
    
    return {
      isOpen,
      details: stdout
    };
  } catch (err) {
    return {
      isOpen: false,
      error: err.message
    };
  }
};

/**
 * Generate Postfix configuration for a domain
 * @param {String} domainName The primary domain name
 * @returns {Object} Postfix configuration
 */
exports.generatePostfixConfig = async (domainName) => {
  const hostname = os.hostname();
  const serverIP = exports.getServerIP();
  
  return `
# Postfix configuration for ${domainName}
# Generated on ${new Date().toISOString()}

# Basic Settings
myhostname = mail.${domainName}
mydomain = ${domainName}
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, localhost.$mydomain, localhost
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
relay_domains = 
mail_owner = postfix
setgid_group = postdrop

# TLS Configuration
smtpd_use_tls = yes
smtpd_tls_security_level = may
smtpd_tls_auth_only = yes
smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key
smtpd_tls_session_cache_database = btree:\${data_directory}/smtpd_scache
smtp_tls_session_cache_database = btree:\${data_directory}/smtp_scache

# SMTP Auth Configuration
smtpd_sasl_auth_enable = yes
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_security_options = noanonymous
smtpd_sasl_local_domain = $myhostname
broken_sasl_auth_clients = yes

# Message and connection limits
message_size_limit = 10240000
mailbox_size_limit = 0
recipient_delimiter = +
maximal_queue_lifetime = 1d
bounce_queue_lifetime = 1d
smtp_destination_concurrency_limit = 2
smtp_destination_rate_delay = 1s
default_process_limit = 100
smtp_connection_cache_on_demand = yes
smtp_connection_cache_destinations = 
smtp_connection_reuse_time_limit = 300s

# Anti-spam configuration
smtpd_recipient_restrictions =
    permit_mynetworks,
    permit_sasl_authenticated,
    reject_unauth_destination,
    reject_invalid_hostname,
    reject_unauth_pipelining,
    reject_non_fqdn_recipient,
    reject_unknown_recipient_domain
`;
};

/**
 * Generate virtual domains configuration for Postfix
 * @returns {Object} Results with configuration files content
 */
exports.generateVirtualDomainsConfig = async () => {
  try {
    // Get all active domains with their mailboxes and aliases
    const domains = await Domain.findAll({
      where: { status: DOMAIN_STATUS.ACTIVE },
      include: [
        {
          model: Mailbox,
          where: { status: DOMAIN_STATUS.ACTIVE },
          required: false
        },
        {
          model: Alias,
          where: { status: DOMAIN_STATUS.ACTIVE },
          required: false
        }
      ]
    });
    
    if (domains.length === 0) {
      return {
        success: false,
        error: "No active domains found"
      };
    }
    
    // Get primary domain
    const primaryDomain = domains.find(d => d.is_primary);
    if (!primaryDomain) {
      return {
        success: false,
        error: "No primary domain configured"
      };
    }
    
    // Create domain list for virtual_mailbox_domains
    const domainList = domains.map(d => d.name).join(', ');
    
    // Create virtual domains list (one per line)
    const virtualDomains = domains.map(d => d.name).join('\n');
    
    // Create virtual mailboxes mapping
    let virtualMailboxes = '';
    domains.forEach(domain => {
      if (domain.Mailboxes && domain.Mailboxes.length > 0) {
        domain.Mailboxes.forEach(mailbox => {
          virtualMailboxes += `${mailbox.email} ${domain.name}/${mailbox.username}/\n`;
        });
      }
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
    
    // Create virtual domains configuration block for main.cf
    const virtualDomainsConfigBlock = `
# Virtual Domains Configuration
virtual_mailbox_domains = ${domainList}
virtual_mailbox_base = /var/mail/vhosts
virtual_mailbox_maps = hash:/etc/postfix/virtual_mailbox_maps
virtual_alias_maps = hash:/etc/postfix/virtual_alias_maps
virtual_minimum_uid = 100
virtual_uid_maps = static:5000
virtual_gid_maps = static:5000
`;
    
    // Generate main.cf with virtual domains configuration
    const mainCfContent = await exports.generatePostfixConfig(primaryDomain.name) + virtualDomainsConfigBlock;
    
    return {
      success: true,
      mainCfContent,
      virtualDomains,
      virtualMailboxes,
      virtualAliases,
      domainList
    };
  } catch (err) {
    console.error('Error generating virtual domains configuration:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Apply Postfix configuration with virtual domains
 * @param {Boolean} forceRestart Whether to force restart Postfix (default: false)
 * @returns {Object} Result of configuration application
 */
exports.applyConfiguration = async (forceRestart = false) => {
  try {
    // Generate configuration
    const config = await exports.generateVirtualDomainsConfig();
    
    if (!config.success) {
      return {
        success: false,
        error: "Could not generate configuration",
        details: config.error
      };
    }
    
    // Create temporary files
    const tempDir = os.tmpdir();
    const tempMainCf = path.join(tempDir, `postfix_main_cf_${Date.now()}`);
    const tempVirtualMailboxMaps = path.join(tempDir, `virtual_mailbox_maps_${Date.now()}`);
    const tempVirtualAliasMaps = path.join(tempDir, `virtual_alias_maps_${Date.now()}`);
    
    fs.writeFileSync(tempMainCf, config.mainCfContent);
    fs.writeFileSync(tempVirtualMailboxMaps, config.virtualMailboxes);
    fs.writeFileSync(tempVirtualAliasMaps, config.virtualAliases);
    
    // Create vmail user and directories
    try {
      // Create vmail user and group if they don't exist
      await execPromise(`sudo groupadd -g 5000 vmail 2>/dev/null || true`);
      await execPromise(`sudo useradd -u 5000 -g vmail -s /usr/sbin/nologin -d /var/mail/vhosts vmail 2>/dev/null || true`);
      
      // Create base directory
      await execPromise(`sudo mkdir -p /var/mail/vhosts`);
      
      // Create directory for each domain
      const domains = config.virtualDomains.split('\n');
      for (const domain of domains) {
        if (domain.trim()) {
          await execPromise(`sudo mkdir -p /var/mail/vhosts/${domain.trim()}`);
        }
      }
      
      // Set permissions
      await execPromise(`sudo chown -R vmail:vmail /var/mail/vhosts`);
    } catch (err) {
      console.warn('Warning: Could not set up vmail user or directories:', err.message);
      // Continue anyway
    }
    
    // Copy configuration files
    await execPromise(`sudo cp ${tempMainCf} /etc/postfix/main.cf`);
    await execPromise(`sudo cp ${tempVirtualMailboxMaps} /etc/postfix/virtual_mailbox_maps`);
    await execPromise(`sudo cp ${tempVirtualAliasMaps} /etc/postfix/virtual_alias_maps`);
    
    // Build database maps
    await execPromise(`sudo postmap /etc/postfix/virtual_mailbox_maps`);
    await execPromise(`sudo postmap /etc/postfix/virtual_alias_maps`);
    
    // Restart or reload Postfix
    if (forceRestart) {
      await execPromise(`sudo systemctl restart postfix`);
    } else {
      await execPromise(`sudo postfix reload`);
    }
    
    // Clean up temporary files
    fs.unlinkSync(tempMainCf);
    fs.unlinkSync(tempVirtualMailboxMaps);
    fs.unlinkSync(tempVirtualAliasMaps);
    
    return {
      success: true,
      message: forceRestart ? "Postfix configuration applied and service restarted" : "Postfix configuration applied and service reloaded"
    };
  } catch (err) {
    console.error('Error applying Postfix configuration:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Generate installation instructions for Postfix
 * @returns {String} Installation instructions
 */
exports.getInstallationInstructions = () => {
  const serverIP = exports.getServerIP();
  
  return `
# Postfix Installation and Setup Instructions

## 1. Install Postfix and required packages
\`\`\`
sudo apt-get update
sudo apt-get install -y postfix dovecot-core dovecot-imapd dovecot-pop3d
\`\`\`

During installation, select "Internet Site" and enter your primary domain name.

## 2. Open required ports in firewall
\`\`\`
sudo ufw allow 25/tcp   # SMTP
sudo ufw allow 587/tcp  # Submission
sudo ufw allow 465/tcp  # SMTPS
sudo ufw allow 110/tcp  # POP3
sudo ufw allow 995/tcp  # POP3S
sudo ufw allow 143/tcp  # IMAP
sudo ufw allow 993/tcp  # IMAPS
\`\`\`

## 3. Set up DNS records for your domain:

### MX Record
- Type: MX
- Host: @
- Priority: 10
- Value: mail.yourdomain.com

### A Record for mail subdomain
- Type: A
- Host: mail
- Value: ${serverIP}

### SPF Record 
- Type: TXT
- Host: @
- Value: v=spf1 mx a ip4:${serverIP} ~all

### DKIM (after generating keys)
- Type: TXT
- Host: default._domainkey
- Value: v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY

### DMARC Record
- Type: TXT
- Host: _dmarc
- Value: v=DMARC1; p=none; rua=mailto:postmaster@yourdomain.com

## 4. Configure PTR (Reverse DNS)
Contact your hosting provider to set up a PTR record for ${serverIP} pointing to your mail server's FQDN.

## 5. Test your setup
Use the API endpoints to add domains, mailboxes, and aliases, then use mail clients to test the configuration.
`;
};