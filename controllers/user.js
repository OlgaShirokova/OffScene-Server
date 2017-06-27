import db from '~/models';
import { userInfoSelector, eventsSelector } from '~/selectors/user';
const { User, Calendar, AwayDay, Event } = db;
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
  const attributes = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const user = await User.findById(djId, {
    include: [{ model: Calendar, attributes }, AwayDay],
  });

  if (!user || user.get().role === 1) {
    // user does not exist or is an organizer
    ctx.throw(400, 'Not Authorized');
  }

  const genres = await db.connection.models.djGenres.findAll({
    where: { userId: djId },
  });

  user.dataValues.genres = genres ? genres : []; // TODO: change instead of returning null it atlways returned an empty array when there are no results

  ctx.body = userInfoSelector(user.get());
}

async function profile(ctx) {
  const userId = ctx.user.get().id;
  let {
    email,
    password,
    role,
    staff,
    genres,
    calendar,
    awayDays,
    city,
    ...userInfo
  } = ctx.request.body;

  const user = await User.findById(userId, {
    include: [{ model: Calendar }, AwayDay],
  });

  const calendarId = user.calendar.get().id;

  const [lat, long] = await getCoords('Barcelona');

  userInfo.city = city;
  userInfo.lat = lat;
  userInfo.long = long;
  // TODO  genres and clean
  awayDays = awayDays.map(date => ({ date, userId }));

  await Promise.all([
    User.update(userInfo, { where: { id: userId } }),
    Calendar.update(calendar, { where: { id: calendarId } }),
    AwayDay.bulkCreate(awayDays),
  ]);

  ctx.status = 201;
}

async function blockUser(ctx) {
  const userId = ctx.user.get().id;
  const blockedUserId = ctx.params.id;

  const userToBlock = await User.findById(blockedUserId);

  if (userToBlock) {
    await db.connection.models.blockedUser.create({
      userId,
      blockedUserId,
    });
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
        - The dates received are already stored in the db

      This operation only affects the user that is performing it and due this reason we think that it's better to rely
      on the client-side. Using a date picker will do the job ☜(˚▽˚)☞
    */
    ctx.throw(400, 'Invalid Input');
  }

  try {
    await AwayDay.bulkCreate(awayDays.map(date => ({ date, userId })));
  } catch (err) {
    //this error its only going to happen when the database is not available
    ctx.throw(500, 'Service not Available');
  }

  ctx.status = 201;
}

async function deleteAway(ctx) {
  const userId = ctx.user.get().id;

  const awayDays = ctx.request.body.awayDays;

  await AwayDay.destroy({
    where: {
      $and: {
        userId,
        $or: awayDays.map(date => ({ date })),
      },
    },
  });

  // await Promise.all(
  //   awayDays.map(date =>
  //     AwayDay.destroy({
  //       where: {
  //         userId,
  //         date,
  //       },
  //     })
  //   )
  // )

  ctx.body = 201;
}

export default {
  events,
  userInfo,
  profile,
  blockUser,
  postAway,
  deleteAway,
};
