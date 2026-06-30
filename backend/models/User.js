const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already registered.'
      },
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address.'
        },
        notNull: {
          msg: 'Email is required.'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password is required.'
        },
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters long.'
        }
      }
    }
  }, {
    timestamps: true,
  });

  return User;
};
