export default function(sequelize, DataTypes) {
  const Event = sequelize.define(
    'event',
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
      associate: function({ Event, User }) {
        Event.belongsTo(User, { as: 'actor' });
        Event.belongsTo(User, { as: 'org' });
      },
    }
  );

  return Event;
}
