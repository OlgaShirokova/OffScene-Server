export default function(sequelize, DataTypes) {
  const AwayDay = sequelize.define(
    'awayDay',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
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
