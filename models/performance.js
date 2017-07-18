export default function(sequelize, DataTypes) {
  const Performance = sequelize.define(
    'performance',
    {
      date: DataTypes.DATE,
      status: DataTypes.INTEGER,
      actorRating: DataTypes.FLOAT,
      orgRating: DataTypes.FLOAT,
      price: DataTypes.INTEGER,
      location: DataTypes.STRING,
      lat: DataTypes.FLOAT,
      long: DataTypes.FLOAT,
    },
    {
      associate: function({ Performance, User }) {
        Performance.belongsTo(User, { as: 'actor' });
        Performance.belongsTo(User, { as: 'org' });
      },
    }
  );

  return Performance;
}
