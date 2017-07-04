import { encryptAsync } from '~/utils/bcrypt';
import { userInfoIncludes } from '~/models';
import { userInfoSelector } from '~/selectors/user';

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

  User.getInfoByEmail = function(email, selector) {
    return this.getInfo('email', email, selector);
  };

  User.getInfoById = function(id, selector) {
    return this.getInfo('id', id, selector);
  };

  User.getInfo = async function(attr, value, selector) {
    const info = await this.find(
      {
        where: { [attr]: value },
        include: userInfoIncludes,
      }
      // {
      // }
    );
    return selector ? selector(info) : info;
  };

  User.updateInfoById = function(id, info) {
    return User.update(info, {
      attributes: [
        'name',
        'picture',
        'priceWe',
        'priceWd',
        'city',
        'bankAccount',
        'swift',
        'lat',
        'long',
      ],
      where: { id },
    });
  };

  return User;
}
