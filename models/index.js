'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
import config from '../config';
const {
  dbName,
  user,
  password,
  host,
  dialect,
  logging,
  storage,
} = config.development;

const sequelize = new Sequelize(dbName, user, password, {
  host,
  dialect,
  logging,
  storage,
});

const db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return file.indexOf('.') !== 0 && file !== 'index.js';
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].options.hasOwnProperty('associate')) {
    db[modelName].options.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

sequelize.sync({
  loggin: console.log,
  force: true,
});
