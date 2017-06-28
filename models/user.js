import { encryptAsync } from '~/utils/bcrypt';

export default function(sequelize, DataTypes) {
  const User = sequelize.define(
    'user',
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
      },
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
      associate: function({ User, AwayDay, Calendar, Event, MusicGenre }) {
        User.hasMany(AwayDay);
        User.hasOne(Calendar);
        // User.hasMany(Event);
        User.belongsToMany(User, {
          through: 'blockedUser',
          as: 'blockedUsers',
        });
        User.belongsToMany(MusicGenre, { through: 'djGenres' });
      },
      hooks: {
        beforeCreate: async function(user) {
          user.password = await encryptAsync(user.password);
        },
      },
    }
  );

  return User;
}
