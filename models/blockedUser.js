export default function(sequelize, DataTypes) {
  const BlockedUser = sequelize.define(
    'blockedUser',
    {
      blockedUserId: DataTypes.INTEGER,
    },
    {
      timestamps: false,
      associate: function({ BlockedUser, User }) {
        BlockedUser.belongsTo(User);
      },
    }
  );

  return BlockedUser;
}
