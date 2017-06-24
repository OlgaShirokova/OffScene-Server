'use strict';

module.exports = function(sequelize, DataTypes) {
  const AwayDay = sequelize.define('AwayDay', {
    date: DataTypes.DATE,
  });

  return AwayDay;
};
