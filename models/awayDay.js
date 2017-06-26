export default function(sequelize, DataTypes) {
  const AwayDay = sequelize.define(
    'awayDay',
    {
      date: DataTypes.DATE,
    },
    {
      timestamps: false,
      associate: function({ AwayDay, User }) {
        AwayDay.belongsTo(User);
      },
    }
  );

  return AwayDay;
}
