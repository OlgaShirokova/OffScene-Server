'use strict';

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      username: DataTypes.STRING,
    },
    {
      classMethods: {
        associate: function(models) {
          User.hasMany(models.Event);
        },
      },
    }
  );

  return User;
};
