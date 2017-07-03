import db, { eventsAttr, getRole, userInfoIncludes } from '~/models';
import { userInfoSelector } from '~/selectors/user';
const { User, Calendar, AwayDay, Event, MusicGenre } = db;
import { getCoords } from '~/utils/googleApi';
import { uploadPicture } from '~/utils/awsSdk';

async function events(ctx) {
  const role = getRole(ctx);

  try {
    ctx.body = await Event.findAll({
      where: {
        [role]: ctx.user.id,
      },
      attributes: eventsAttr,
    });
  } catch (err) {
    ctx.throw(500, 'Service not Available');
  }
}

async function userInfo(ctx) {
  const { id: djId } = ctx.params;

  try {
    const user = await User.getInfoById(djId, userInfoSelector);

    if (!user || user.role === 1) {
      // user does not exist or is an organizer
      ctx.throw(400, 'Not Authorized');
    }

    ctx.body = user;
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
      User.updateInfoById(userId, userInfo),
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

async function updatePicture(ctx) {
  const userId = ctx.user.id;
  const formData = ctx.request.body;
  const filePath = formData.files.picture.path;
  try {
    const picture = await uploadPicture(filePath, `avatar_${userId}.png`);

    await User.updateInfoById(userId, { picture: picture.Location });

    const user = await User.getInfoById(djId);

    ctx.status = 200;
    ctx.body = user;
  } catch (err) {
    ctx.throw(400, 'Invalid Input');
  }
}

async function blockUser(ctx) {
  const userId = ctx.user.id;
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
  const userId = ctx.user.id;
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
  const userId = ctx.user.id;
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
  updatePicture,
  blockUser,
  postAway,
  deleteAway,
};
