export default function(sequelize, DataTypes) {
  const MovieGenre = sequelize.define(
    'movieGenre',
    {
      name: {
        type: DataTypes.STRING,
        // primaryKey: true,
      },
    },
    {
      associate: function({ MovieGenre, User }) {
        MovieGenre.belongsToMany(User, { through: 'actorGenres' });
      },
      timestamps: false,
    }
  );

  return MovieGenre;
}
