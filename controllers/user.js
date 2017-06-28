import db from '~/models';
import { userInfoSelector } from '~/selectors/user';
const { User, Calendar, AwayDay, Event, MusicGenre } = db;
import { getCoords } from '~/utils/googleApi';

async function events(ctx) {
  const djId = 'djId';
  const orgId = 'orgId';
  const role = [djId, orgId][ctx.user.get().role];
  const attributes = [
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
    djId,
    orgId,
  ];

  try {
    ctx.body = await Event.findAll({
      where: {
        [role]: ctx.user.get().id,
      },
      attributes,
    });
  } catch (err) {
    ctx.throw(500, 'Service not Available');
  }
}

async function userInfo(ctx) {
  const { id: djId } = ctx.params;
  const calendarAttr = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  try {
    const user = await User.findById(djId, {
      include: [
        { model: Calendar, attributes: calendarAttr },
        { model: AwayDay, attributes: ['date'] },
        { model: MusicGenre, attributes: ['name'] },
      ],
    });

    if (!user || user.get().role === 1) {
      // user does not exist or is an organizer
      ctx.throw(400, 'Not Authorized');
    }

    ctx.body = userInfoSelector(user);
  } catch (err) {
    ctx.throw(500, 'Service not Available');
  }
}

async function updateProfile(ctx) {
  const userId = ctx.user.id;
  let {
    calendar,
    awayDays = [],
    musicGenres = [],
    ...userInfo
  } = ctx.request.body;

  const coords = await getCoords(userInfo.city);

  if (!coords) {
    ctx.throw(400, 'Invalid Input');
  }

  try {
    const user = await User.findById(userId, {
      include: [{ model: Calendar }, AwayDay],
    });
    const storedCalendar = user.calendar;

    userInfo.lat = coords.lat;
    userInfo.long = coords.long;

    awayDays = awayDays.map(date => ({ date, userId }));
    musicGenres = musicGenres.map(musicGenreName => ({
      musicGenreName,
      userId,
    }));

    await Promise.all([
      User.update(userInfo, {
        attributes: [
          'name',
          'picture',
          'priceWe',
          'priceWd',
          'city',
          'bankAccount',
          'swift',
          'lat',
          'long',
        ],
        where: { id: userId },
      }),
      storedCalendar
        ? Calendar.update(calendar, { where: { id: storedCalendar.id } })
        : Calendar.create({ ...calendar, userId }),
      AwayDay.bulkCreate(awayDays),
      db.connection.models.djGenres.bulkCreate(musicGenres),
    ]);
  } catch (err) {
    ctx.throw(400, 'Invalid Input'); // in 99 % of the cases it's going to be the cause of the error, the other 1 % is db reachability issues
  }

  ctx.status = 201;
}

async function blockUser(ctx) {
  const userId = ctx.user.get().id;
  const blockedUserId = ctx.params.id;

  try {
    const userToBlock = await User.findById(blockedUserId);
    if (userId !== blockedUserId && userToBlock && userToBlock.role === 1) {
      // exists and it's an organizer
      await db.connection.models.blockedUser.create({
        userId,
        blockedUserId,
      });
    }
  } catch (err) {
    if (err.message !== 'Validation error') {
      ctx.throw(500, 'Service not Available');
    }
  }

  ctx.status = 201;
}

async function postAway(ctx) {
  const userId = ctx.user.get().id;
  let { awayDays } = ctx.request.body;

  if (!awayDays || !Array.isArray(awayDays)) {
    /*
      We're doing an optimistic validation by only checking that the shape of the data received is correct.

      Basically we're ignoring the following cases:
        - The dates received are not valid dates, ej: [1,2,3]

      This operation only affects the user that is performing it and due this reason we think that it's better to rely
      on the client-side. Using a date picker will do the job ☜(˚▽˚)☞
    */
    ctx.throw(400, 'Invalid Input');
  }

  try {
    await AwayDay.bulkCreate(
      awayDays.map(date => ({
        id: Number(String(new Date(date).getTime()) + String(userId)),
        date,
        userId,
      }))
    );
  } catch (err) {
    if (err.message === 'Validation error') {
      ctx.throw(400, 'Invalid Input');
    }
    //this error its only going to happen when the database is not available
    ctx.throw(500, 'Service not Available');
  }

  ctx.status = 201;
}

async function deleteAway(ctx) {
  const userId = ctx.user.get().id;
  const awayDays = ctx.request.body.awayDays;

  if (!awayDays || !Array.isArray(awayDays)) {
    ctx.throw(400, 'Invalid Input');
  }

  try {
    await AwayDay.destroy({
      where: {
        $and: {
          userId,
          $or: awayDays.map(date => ({ date })),
        },
      },
    });
  } catch (err) {
    ctx.throw(500, 'Service not Available');
  }

  ctx.status = 201;
}

export default {
  events,
  userInfo,
  updateProfile,
  blockUser,
  postAway,
  deleteAway,
};
