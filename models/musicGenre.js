'use strict';

module.exports = function(sequelize, DataTypes) {
  const MusicGenre = sequelize.define(
    'MusicGenre',
    {
      name: DataTypes.STRING,
    },
    {
      associate: function(models) {
        models.MusicGenre.belongsToMany(models.User, { through: 'djGenres' });
      },
    }
  );

  return MusicGenre;
};
