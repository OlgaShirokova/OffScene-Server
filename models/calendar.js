export default function(sequelize, DataTypes) {
  const Calendar = sequelize.define(
    'calendar',
    {
      monday: DataTypes.INTEGER,
      tuesday: DataTypes.INTEGER,
      wednesday: DataTypes.INTEGER,
      thursday: DataTypes.INTEGER,
      friday: DataTypes.INTEGER,
      saturday: DataTypes.INTEGER,
      sunday: DataTypes.INTEGER,
    },
    {
      associate: function({ Calendar, User }) {
        Calendar.belongsTo(User);
      },
      timestamps: false,
    }
  );

  return Calendar;
}
