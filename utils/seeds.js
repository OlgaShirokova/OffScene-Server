import faker from 'faker';
import axios from 'axios';
import Sequelize from 'sequelize';
import db from '~/models';
// import config from '~/config';
import nconf from '~/config/nconf';
const { User, AwayDay, Calendar, Event, MusicGenre } = db;

const NUM_ITERATIONS = 3;
let userCity = '';
let eventCity = '';
let uLat = 0;
let uLng = 0;
let eLat = 0;
let eLng = 0;

db.connection
  .sync({
    loggin: console.log,
    force: true,
  })
  .then(function() {
    createMockGenres();
    for (var i = 0; i < NUM_ITERATIONS; i++) {
      userCity = 'Barcelona';
      eventCity = 'Paris';
      getUserCity(userCity);
      getEventCity(eventCity).then(function() {
        createMockData();
      });
    }
  });

function getUserCity(userCity) {
  return axios
    .get(`https://maps.googleapis.com/maps/api/geocode/json?`, {
      params: {
        address: userCity,
        key: 'AIzaSyB8MoySVfE5fBLlpQhCnE_i_Ammrpp4BgM',
      },
    })
    .then(res => res)
    .then(data => {
      uLat = data.data.results[0].geometry.location.lat;
      uLng = data.data.results[0].geometry.location.lng;
    })
    .catch(err => console.log(err));
}

function getEventCity(eventCity) {
  return axios
    .get(`https://maps.googleapis.com/maps/api/geocode/json?`, {
      params: {
        address: eventCity,
        key: 'AIzaSyB8MoySVfE5fBLlpQhCnE_i_Ammrpp4BgM',
      },
    })
    .then(res => res)
    .then(data => {
      eLat = data.data.results[0].geometry.location.lat;
      eLng = data.data.results[0].geometry.location.lng;
    })
    .catch(err => console.log(err));
}

async function createMockGenres() {
  const musicGenre = await MusicGenre.bulkCreate([
    {
      name: 'techno',
    },
    {
      name: 'house',
    },
  ]);
}

async function createMockData() {
  const org = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.name.findName(),
    role: 1,
    staff: Math.round(Math.random()),
    picture: faker.image.avatar(),
    city: userCity,
    lat: uLat,
    long: uLng,
    avgRating: parseFloat(Math.random() * 5).toFixed(2),
  });

  const dj = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.name.findName(),
    role: 0,
    staff: Math.round(Math.random()),
    picture: faker.image.avatar(),
    priceWe: Math.round(Math.random() * 10000 * 100),
    priceWd: Math.round(Math.random() * 10000 * 100),
    city: userCity,
    lat: uLat,
    long: uLng,
    avgRating: parseFloat(Math.random() * 5).toFixed(2),
    bankAccount: faker.finance.iban(),
    swift: faker.finance.bic(),
  });

  const awayDay = await AwayDay.bulkCreate([
    {
      date: faker.date.future(),
      userId: dj.get().id,
    },
    {
      date: faker.date.future(),
      userId: dj.get().id,
    },
  ]);

  const calendar = await Calendar.create({
    monday: Math.round(Math.random()),
    tuesday: Math.round(Math.random()),
    wednesday: Math.round(Math.random()),
    thursday: Math.round(Math.random()),
    friday: Math.round(Math.random()),
    saturday: Math.round(Math.random()),
    sunday: Math.round(Math.random()),
    userId: dj.get().id,
  });

  const event = await Event.bulkCreate([
    {
      date: faker.date.future(),
      status: Math.round(Math.random() * 4),
      djRating: parseFloat(Math.random() * 5).toFixed(2),
      orgRating: parseFloat(Math.random() * 5).toFixed(2),
      price: Math.round(Math.random() * 10000 * 100),
      location: eventCity,
      lat: eLat,
      long: eLng,
      djId: dj.get().id,
      orgId: org.get().id,
    },
    {
      date: faker.date.future(),
      status: Math.round(Math.random() * 4),
      djRating: parseFloat(Math.random() * 5).toFixed(2),
      orgRating: parseFloat(Math.random() * 5).toFixed(2),
      price: Math.round(Math.random() * 10000 * 100),
      location: eventCity,
      lat: eLat,
      long: eLng,
      djId: dj.get().id,
      orgId: org.get().id,
    },
  ]);

  const blockedUser = await db.connection.models.blockedUser.create({
    userId: dj.get().id,
    blockedUserId: org.get().id,
  });

  const djGenres = await db.connection.models.djGenres.bulkCreate([
    {
      musicGenreId: '1',
      userId: dj.get().id,
    },
    {
      musicGenreId: '2',
      userId: dj.get().id,
    },
  ]);
}