'use strict';

module.exports = function(sequelize, DataTypes) {
  const Event = sequelize.define(
    'Event',
    {
      date: DataTypes.DATE,
      status: DataTypes.INTEGER,
      djRating: DataTypes.INTEGER,
      orgRating: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      location: DataTypes.STRING,
    },
    {
      associate: function(models) {
        models.Event.belongsTo(models.User, { as: 'dj' });
        models.Event.belongsTo(models.User, { as: 'org' });
      },
    }
  );

  return Event;
};
