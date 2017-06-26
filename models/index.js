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

connection.sync({
  loggin: console.log,
  force: true,
});

export default db;
