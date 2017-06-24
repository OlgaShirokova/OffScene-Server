'use strict';

module.exports = function(sequelize, DataTypes) {
  const Calendar = sequelize.define(
    'Calendar',
    {
      monday: DataTypes.INTEGER,
      tuesday: DataTypes.INTEGER,
      wednesday: DataTypes.INTEGER,
      thursday: DataTypes.INTEGER,
      friday: DataTypes.INTEGER,
      saturday: DataTypes.INTEGER,
      sunday: DataTypes.INTEGER,
    },
    {
      associate: function(models) {
        models.Calendar.belongsTo(models.User);
      },
    }
  );

  return Calendar;
};
