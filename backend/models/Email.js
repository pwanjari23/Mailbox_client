const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Email = sequelize.define('Email', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    senderEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Invalid sender email address.'
        },
        notNull: {
          msg: 'Sender email is required.'
        }
      }
    },
    receiverEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Invalid receiver email address.'
        },
        notNull: {
          msg: 'Receiver email is required.'
        }
      }
    },
    subject: {
      type: DataTypes.STRING,
      defaultValue: '(No Subject)',
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Email body is required.'
        }
      }
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }
  }, {
    timestamps: true,
  });

  return Email;
};
