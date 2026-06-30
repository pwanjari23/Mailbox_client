const { getSequelize } = require('../config/db');

const models = {};

function initModels() {
  const sequelize = getSequelize();
  
  // Import model definitions
  const User = require('./User')(sequelize);
  
  models.User = User;
  models.sequelize = sequelize;
  
  return models;
}

module.exports = {
  initModels,
  models
};
