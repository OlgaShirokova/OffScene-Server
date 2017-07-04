import base64 from 'base-64';
import db, { calendarAttr, getRole, djId, orgId } from '~/models';
const { Event, User, Calendar, AwayDay, MusicGenre } = db;
import { getCoords } from '~/utils/googleApi';
import { distToDegreeLat, distToDegreeLon } from '~/utils/geo';
import { userInfoSelector } from '~/selectors/user';
async function search(ctx) {
  let { priceMin, priceMax, date, musicGenre, city, maxDistance } = ctx.query;

  const calendarAttr = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const weekDay = calendarAttr[new Date(Number(date)).getDay()];

  const isoDate = new Date(Number(date)).toISOString().split('T')[0];

  const genres = [...base64.decode(musicGenre).split(',')];

  const lat = distToDegreeLat(maxDistance);
  const long = distToDegreeLon(maxDistance, lat);
  const coords = await getCoords(city);

  const rangeLat = [coords.lat - lat, coords.lat + lat];
  const rangeLong = [coords.long - long, coords.long + long];

  const users = await User.findAll({
    where: {
      $and: {
        '$musicGenres.name$': {
          $in: genres,
        },
        lat: {
          $between: rangeLat,
        },
        long: {
          $between: rangeLong,
        },

        role: 0,
        [new Date(Number(date)).getDay() <= 5 ? 'priceWd' : 'priceWe']: {
          $between: [priceMin, priceMax],
        },
      },
    },
    include: [
      { model: Calendar, attributes: calendarAttr, where: { [weekDay]: 1 } },
      {
        model: AwayDay,
        attributes: ['date'],
      },
      {
        model: MusicGenre,
        attributes: ['name'],
      },
    ],
  });

  ctx.body = users.map(user => userInfoSelector(user));
}
async function offers(ctx) {
  const { id: orgId, role } = ctx.user;
  const { djId, price, location, date } = ctx.request.body;

  if (role !== 1) {
    ctx.throw(400, 'Not Authorized');
  }

  if (isNaN(price) || typeof price !== 'number') {
    ctx.throw(400, 'Invalid Input');
  }

  const [dj, coords] = await Promise.all([
    User.findById(djId),
    getCoords(location),
  ]);

  if (!dj || !coords) {
    ctx.throw(400, 'Invalid Input');
  }
  const { lat, long } = coords;

  try {
    await Event.create({
      djId,
      orgId,
      price,
      status: 0,
      location,
      lat,
      long,
      date,
    });
  } catch (err) {
    ctx.throw(500, 'Service not Available');
  }

  ctx.status = 201;
}

async function feedback(ctx) {
  const { eventId, rating } = ctx.request.body;
  const event = await Event.findById(eventId);
  const otherParticipant = ['djRating', 'orgRating'][+!ctx.user.get().role];

  if (!event) {
    ctx.throw(400, 'Invalid Input');
  }

  if (event[otherParticipant]) {
    ctx.throw(400, 'You already voted');
  }

  event.updateAttributes({
    [otherParticipant]: rating,
  });

  ctx.status = 201;
}

async function updateOffer(ctx) {
  const { eventId, status: newStatus } = ctx.request.body;
  const role = getRole(ctx);

  const event = await Event.findById(eventId, {
    where: {
      [role]: ctx.user.id,
    },
  });

  if (!event) {
    ctx.throw(400, 'Not Authorized');
  }

  if (
    !(
      (role === djId &&
        event.status === 0 &&
        (newStatus === 1 || newStatus === 2)) ||
      (role === orgId &&
        event.status === 2 &&
        (newStatus === 3 || newStatus === 4))
    )
  ) {
    ctx.throw(400, 'Not Authorized');
  }
  await Event.update(
    {
      status: newStatus,
    },
    {
      where: { id: eventId },
    }
  );

  ctx.status = 201;
}

export default {
  search,
  offers,
  feedback,
  updateOffer,
};
