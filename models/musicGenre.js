export default function(sequelize, DataTypes) {
  const MusicGenre = sequelize.define(
    'musicGenre',
    {
      name: {
        type: DataTypes.STRING,
        // primaryKey: true,
      },
    },
    {
      associate: function({ MusicGenre, User }) {
        MusicGenre.belongsToMany(User, { through: 'djGenres' });
      },
      timestamps: false,
    }
  );

  return MusicGenre;
}
