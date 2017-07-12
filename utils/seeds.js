import faker from 'faker';
import axios from 'axios';
import Sequelize from 'sequelize';
import db from '~/models';
// import config from '~/config';
import nconf from '~/config/nconf';
const { User, AwayDay, Calendar, Event, MovieGenre } = db;

const NUM_ITERATIONS = 40;
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
  const movieGenre = await MovieGenre.bulkCreate([
    {
      name: 'comedy',
    },
    {
      name: 'action',
    },
  ]);
}

async function createMockData() {
  const org = await User.create({
    email: faker.internet.email(),
    password: 'test',
    name: faker.name.findName(),
    role: 1,
    staff: Math.round(Math.random()),
    picture: faker.image.avatar(),
    city: userCity,
    lat: uLat,
    long: uLng,
    avgRating: parseFloat(Math.random() * 5).toFixed(2),
  });

  const actor = await User.create({
    email: faker.internet.email(),
    password: 'test',
    name: faker.name.findName(),
    role: 0,
    staff: Math.round(Math.random()),
    picture: faker.image.avatar(),
    priceWe: Math.round(Math.random() * 5500),
    priceWd: Math.round(Math.random() * 5500),
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
      userId: actor.get().id,
    },
    {
      date: faker.date.future(),
      userId: actor.get().id,
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
    userId: actor.get().id,
  });

  const event = await Event.bulkCreate([
    {
      date: faker.date.future(),
      status: Math.round(Math.random() * 4),
      actorRating: parseFloat(Math.random() * 5).toFixed(2),
      orgRating: parseFloat(Math.random() * 5).toFixed(2),
      price: Math.round(Math.random() * 10000 * 100),
      location: eventCity,
      lat: eLat,
      long: eLng,
      actorId: actor.get().id,
      orgId: org.get().id,
    },
    {
      date: faker.date.future(),
      status: Math.round(Math.random() * 4),
      actorRating: parseFloat(Math.random() * 5).toFixed(2),
      orgRating: parseFloat(Math.random() * 5).toFixed(2),
      price: Math.round(Math.random() * 10000 * 100),
      location: eventCity,
      lat: eLat,
      long: eLng,
      actorId: actor.get().id,
      orgId: org.get().id,
    },
  ]);

  const blockedUser = await db.connection.models.blockedUser.create({
    userId: actor.get().id,
    blockedUserId: org.get().id,
  });

  const actorGenres = await db.connection.models.actorGenres.bulkCreate([
    {
      movieGenreId: '1',
      userId: actor.get().id,
    },
    {
      movieGenreId: '2',
      userId: actor.get().id,
    },
  ]);
}
