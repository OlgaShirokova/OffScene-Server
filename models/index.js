import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import nconf from '~/config/nconf';
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

connection
  .sync({
    loggin: false,
    //force: true,
  })
  .then(function() {
    // createMovieGenres();
  });

async function createMovieGenres() {
  const movieGenre = await db.MovieGenre.bulkCreate([
    {
      name: 'acid',
    },
    {
      name: 'alternative',
    },
    {
      name: 'band',
    },
    {
      name: 'bass',
    },
    {
      name: 'breaks',
    },
    {
      name: 'breakbeat',
    },
    {
      name: 'chill out',
    },
    {
      name: 'commercial dance',
    },
    {
      name: 'contemporary',
    },
    {
      name: 'cosmic',
    },
    {
      name: 'crunk',
    },
    {
      name: 'dance',
    },
    {
      name: 'dancehall',
    },
    {
      name: 'dance-pop',
    },
    {
      name: 'dance-punk',
    },
    {
      name: 'disco',
    },
    {
      name: 'downtempo',
    },
    {
      name: 'drum',
    },
    {
      name: 'drum & bass',
    },
    {
      name: 'dub',
    },
    {
      name: 'dubstep',
    },
    {
      name: 'ebm',
    },
    {
      name: 'electro house',
    },
    {
      name: 'electroclash',
    },
    {
      name: 'electro-industrial',
    },
    {
      name: 'electronica',
    },
    {
      name: 'eurobeat',
    },
    {
      name: 'freestyle',
    },
    {
      name: 'funk',
    },
    {
      name: 'garage',
    },
    {
      name: 'grime',
    },
    {
      name: 'happy',
    },
    {
      name: 'hard dance',
    },
    {
      name: 'hardcore',
    },
    {
      name: 'hard techno',
    },
    {
      name: 'hardstyle',
    },
    {
      name: 'hi-nrg',
    },
    {
      name: 'hip',
    },
    {
      name: 'hip-hop',
    },
    {
      name: 'house',
    },
    {
      name: 'indie dance',
    },
    {
      name: 'italo',
    },
    {
      name: 'jazz',
    },
    {
      name: 'juke',
    },
    {
      name: 'madchester',
    },
    {
      name: 'minimal',
    },
    {
      name: 'moombahton',
    },
    {
      name: 'motown',
    },
    {
      name: 'nu disco',
    },
    {
      name: 'open format',
    },
    {
      name: 'progressive house',
    },
    {
      name: 'psy-trance',
    },
    {
      name: 'r&b',
    },
    {
      name: 'rave',
    },
    {
      name: 'reggae',
    },
    {
      name: 'rock',
    },
    {
      name: 'roll',
    },
    {
      name: 'swing',
    },
    {
      name: 'synthpop',
    },
    {
      name: 'tech House',
    },
    {
      name: 'techno',
    },
    {
      name: 'technopop',
    },
    {
      name: 'trance',
    },
    {
      name: 'trap',
    },
    {
      name: 'underground',
    },
    {
      name: 'wave',
    },
  ]);
}

export default db;

export const calendarAttr = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const eventsAttr = [
  'id',
  'date',
  'status',
  'djRating',
  'orgRating',
  'price',
  'location',
  'lat',
  'long',
  'createdAt',
  'updatedAt',
  'djId',
  'orgId',
];

export const djId = 'djId';
export const orgId = 'orgId';

export function getRole(ctx) {
  return ['djId', 'orgId'][ctx.user.role];
}

export const userInfoIncludes = [
  { model: db.Calendar, attributes: calendarAttr },
  { model: db.AwayDay, attributes: ['date'] },
  { model: db.MovieGenre, attributes: ['id', 'name'] },
];
