import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from '~/config';
const { dbName, user, password, host, dialect, storage } = config.development;

const connection = new Sequelize(dbName, user, password, {
  host,
  dialect,
  storage,
});

const db = {
  connection,
  Sequelize,
};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return file.indexOf('.') !== 0 && file !== 'index.js';
  })
  .forEach(function(file) {
    const model = connection.import(path.join(__dirname, file));
    db[`${model.name[0].toUpperCase()}${model.name.substr(1)}`] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].options.hasOwnProperty('associate')) {
    db[modelName].options.associate(db);
  }
});

connection
  .sync({
    loggin: console.log,
    // force: true,
  })
  .then(async function() {
    // await db.Event.bulkCreate([
    //   { status: 1, djId: 1, orgId: 3 },
    //   { status: 1, djId: 1, orgId: 3 },
    //   { status: 2, djId: 1, orgId: 3 },
    // ])
    // await db.User.create({
    //   email: 'organizer@gmail.com',
    //   password: 'lalalala',
    //   role: 1,
    // })
    // await db.Calendar.create({
    //   monday: 1,
    //   tuesday: 1,
    //   wednesday: 1,
    //   thursday: 1,
    //   friday: 1,
    //   saturday: 1,
    //   sunday: 1,
    //   userId: 2,
    // })
    // await db.MusicGenre.create({
    //   name: 'rap',
    // })
    // await db.AwayDay.create({
    //   date: '2017-06-30T00:00:00+00:00',
    //   userId: 1,
    // })
    // console.log('mmmmmm', connection.models.djGenres)
    // connection.models.djGenres.create({
    //   userId: 1,
    //   musicGenreName: 'rap',
    // })
    // connection.models.djGenres.create({
    //   userId: 1,
    //   musicGenreName: 'dance',
    // })
    // db.MusicGenre.create({
    //   name: 'rap',
    // })
    // db.MusicGenre.create({
    //   name: 'dance',
    // })
  });

export default db;
