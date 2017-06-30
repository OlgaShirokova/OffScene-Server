import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
const nconf = require('~/config/nconf');
const dbName = nconf.get('DB_NAME');
const user = nconf.get('DB_USERNAME');
const password = nconf.get('DB_PASSWORD');
const host = nconf.get('DB_HOST');
const dialect = nconf.get('DB_DIALECT');
const storage = nconf.get('DB_STORAGE');

const connection = new Sequelize(dbName, user, password, {
  host,
  dialect,
  storage,
  logging: false,
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
  loggin: false,
  // force: true,
});

export default db;
