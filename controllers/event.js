import base64 from 'base-64';
import db, { calendarAttr, getRole, actorId, orgId } from '~/models';
const { Event, User, Calendar, AwayDay, MovieGenre } = db;
import { getCoords } from '~/utils/googleApi';
import { distToDegreeLat, distToDegreeLon } from '~/utils/geo';
import { userInfoSelector } from '~/selectors/user';

function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

export default class EventsController {
  constructor() {
    this.getCoords = getCoords;
  }

  async search(ctx) {
    console.log('SEARCH');
    let {
      priceMin = 0,
      priceMax = 99999999,
      date,
      movieGenre,
      city,
      maxDistance,
    } = ctx.query;

    // const calendarAttr = [
    //   'monday',
    //   'tuesday',
    //   'wednesday',
    //   'thursday',
    //   'friday',
    //   'saturday',
    //   'sunday',
    // ];

    // const weekDay = calendarAttr[new Date(Number(date)).getDay()];

    // const isoDate = new Date(Number(date)).toISOString().split('T')[0];

    // const genres = [...base64.decode(movieGenre).split(',')];

    // const lat = distToDegreeLat(maxDistance);
    // const long = distToDegreeLon(maxDistance, lat);
    // const coords = await this.getCoords(city);

    // const rangeLat = [coords.lat - lat, coords.lat + lat];
    // const rangeLong = [coords.long - long, coords.long + long];

    // const users = await User.findAll({
    //   where: {
    //     $and: {
    //       '$movieGenres.name$': {
    //         $in: genres,
    //       },
    //       lat: {
    //         $between: rangeLat,
    //       },
    //       long: {
    //         $between: rangeLong,
    //       },

    //       role: 0,
    //       [new Date(Number(date)).getDay() <= 5 ? 'priceWd' : 'priceWe']: {
    //         $between: [priceMin, priceMax],
    //       },
    //     },
    //   },
    //   include: [
    //     { model: Calendar, attributes: calendarAttr, where: { [weekDay]: 1 } },
    //     {
    //       model: AwayDay,
    //       attributes: ['date'],
    //     },
    //     {
    //       model: MovieGenre,
    //       attributes: ['name'],
    //     },
    //   ],
    // });

    // ctx.body = users.map(user => userInfoSelector(user));
    const users = await User.findAll({
      where: {
        role: 0,
        [new Date(Number(date)).getDay() <= 5 ? 'priceWd' : 'priceWe']: {
          $between: [priceMin, priceMax],
        },
      },
      include: [
        { model: Calendar, attributes: calendarAttr },
        {
          model: AwayDay,
          attributes: ['date'],
        },
        {
          model: MovieGenre,
          attributes: ['id', 'name'],
        },
      ],
    });

    ctx.body = shuffle(users.map(user => userInfoSelector(user)));
  }

  async offers(ctx) {
    const { id: orgId, role } = ctx.user;

    const { actorId, price, location, date } = ctx.request.body;
    console.log('offers', ctx.request.body);
    if (role !== 1) {
      ctx.throw(400, 'Not Authorized');
    }

    if (isNaN(price) || typeof price !== 'number') {
      ctx.throw(400, 'Invalid Input');
    }
    console.log(1);
    try {
      var [actor, coords] = await Promise.all([
        User.findById(actorId),
        getCoords(location),
      ]);
    } catch (err) {
      console.log('fiu', err);
    }

    console.log(2);

    if (!actor || !coords) {
      ctx.throw(400, 'Invalid Input');
    }
    console.log(2);
    const { lat, long } = coords;

    try {
      await Event.create({
        actorId,
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
    console.log(3);
    ctx.status = 201;
  }

  async feedback(ctx) {
    const { eventId, rating } = ctx.request.body;
    const event = await Event.findById(eventId);
    const otherParticipant = ['actorRating', 'orgRating'][
      +!ctx.user.get().role
    ];

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

  async updateOffer(ctx) {
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
        (role === actorId &&
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
}
