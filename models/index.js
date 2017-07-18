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
      name: 'absurdist',
    },
    {
      name: 'action',
    },
    {
      name: 'adult',
    },
    {
      name: 'adventure',
    },
    {
      name: 'animation',
    },
    {
      name: 'comedy',
    },
    {
      name: 'crime',
    },
    {
      name: 'drama',
    },
    {
      name: 'documentary',
    },
    {
      name: 'epic',
    },
    {
      name: 'experimental',
    },
    {
      name: 'fantasy',
    },
    {
      name: 'family',
    },
    {
      name: 'historical',
    },
    {
      name: 'historical fiction',
    },
    {
      name: 'horror',
    },
    {
      name: 'magical realism',
    },
    {
      name: 'musical',
    },
    {
      name: 'mystery',
    },
    {
      name: 'paranoid',
    },
    {
      name: 'philosophical',
    },
    {
      name: 'political',
    },
    {
      name: 'romance',
    },
    {
      name: 'saga',
    },
    {
      name: 'satire',
    },
    {
      name: 'science fiction',
    },
    {
      name: 'series',
    },
    {
      name: 'shows',
    },
    {
      name: 'silent',
    },
    {
      name: 'slice of life',
    },
    {
      name: 'spectacular',
    },
    {
      name: 'spy film',
    },
    {
      name: 'thriller',
    },
    {
      name: 'urban',
    },
    {
      name: 'war',
    },
    {
      name: 'western',
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

export const performancesAttr = [
  'id',
  'date',
  'status',
  'actorRating',
  'orgRating',
  'price',
  'location',
  'lat',
  'long',
  'createdAt',
  'updatedAt',
  'actorId',
  'orgId',
];

export const actorId = 'actorId';
export const orgId = 'orgId';

export function getRole(ctx) {
  return ['actorId', 'orgId'][ctx.user.role];
}

export const userInfoIncludes = [
  { model: db.Calendar, attributes: calendarAttr },
  { model: db.AwayDay, attributes: ['date'] },
  { model: db.MovieGenre, attributes: ['id', 'name'] },
];
