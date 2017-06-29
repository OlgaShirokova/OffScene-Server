import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from '~/config';
const { dbName, user, password, host, dialect, storage } = config.testing;
const MODELS_PATH = `${__dirname}/../models`;

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
  .readdirSync(MODELS_PATH)
  .filter(function(file) {
    return file.indexOf('.') !== 0 && file !== 'index.js';
  })
  .forEach(function(file) {
    const model = connection.import(path.join(MODELS_PATH, file));
    db[`${model.name[0].toUpperCase()}${model.name.substr(1)}`] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].options.hasOwnProperty('associate')) {
    db[modelName].options.associate(db);
  }
});

before(done => {
  connection
    .sync({
      loggin: console.log,
      // force: true,
    })
    .then(() => done());
});

export default db;
