'use strict';

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      email: DataTypes.STRING,
      name: DataTypes.STRING,
      role: DataTypes.INTEGER,
      staff: DataTypes.BOOLEAN,
      picture: DataTypes.STRING,
      priceWe: DataTypes.INTEGER,
      priceWd: DataTypes.INTEGER,
      city: DataTypes.STRING,
      lat: DataTypes.FLOAT,
      long: DataTypes.FLOAT,
      avgRating: DataTypes.INTEGER,
      bankAccount: DataTypes.STRING,
      swift: DataTypes.STRING,
    },
    {
      associate: function(models) {
        models.User.hasMany(models.AwayDay);
      },
    }
  );

  return User;
};
