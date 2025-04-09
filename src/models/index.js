// models/index.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const { User } = require("./userModel");

const DOMAIN_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2
};

// Domain model
const Domain = sequelize.define(
  "Domains",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: DOMAIN_STATUS.ACTIVE,
      validate: {
        isIn: [[DOMAIN_STATUS.ACTIVE, DOMAIN_STATUS.INACTIVE]],
      },
    },
    dns_status: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  }
);

// Mailbox model
const Mailbox = sequelize.define(
  "Mailboxes",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Domain,
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    quota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1024, // 1GB in MB
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: DOMAIN_STATUS.ACTIVE,
      validate: {
        isIn: [[DOMAIN_STATUS.ACTIVE, DOMAIN_STATUS.INACTIVE]],
      },
    }
  }
);

// Email Alias model
const Alias = sequelize.define(
  "Aliases",
  {
    alias: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Domain,
        key: 'id'
      }
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: DOMAIN_STATUS.ACTIVE,
      validate: {
        isIn: [[DOMAIN_STATUS.ACTIVE, DOMAIN_STATUS.INACTIVE]],
      },
    }
  }
);

// Server Config model for storing system-wide configuration
const ServerConfig = sequelize.define(
  "ServerConfig",
  {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  }
);
const Message = sequelize.define(
  "Messages",
  {
    messageId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fromEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    toEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    textContent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    htmlContent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mailbox_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Mailbox,
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    headers: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hasAttachments: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }
);
// Establish relationships
Domain.hasMany(Mailbox, { foreignKey: 'domain_id' });
Mailbox.belongsTo(Domain, { foreignKey: 'domain_id' });
Mailbox.belongsTo(User, { foreignKey: 'user_id' });
Message.belongsTo(Mailbox, { foreignKey: 'mailbox_id' });

Domain.hasMany(Alias, { foreignKey: 'domain_id' });
Alias.belongsTo(Domain, { foreignKey: 'domain_id' });

module.exports = {
  Domain,
  Mailbox,
  Alias,
  Message,
  ServerConfig,
  DOMAIN_STATUS
};