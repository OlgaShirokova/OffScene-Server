export default function(sequelize, DataTypes) {
  const User = sequelize.define(
    'user',
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: DataTypes.STRING,
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
      associate: function({ User, AwayDay, Calendar, Event, BlockedUser }) {
        User.hasMany(AwayDay);
        User.hasOne(Calendar);
        User.hasMany(Event);
        User.hasMany(BlockedUser);
      },
    }
  );

  return User;
}
