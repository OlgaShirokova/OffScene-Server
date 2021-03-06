import db, { performancesAttr, getRole, userInfoIncludes } from '~/models';
import { userInfoSelector } from '~/selectors/user';
const { User, Calendar, AwayDay, Performance, MovieGenre } = db;
import { getCoords } from '~/utils/googleApi';
import { uploadPicture } from '~/utils/awsSdk';

export default class UsersController {
  constructor() {
    this.uploadPicture = uploadPicture;
    this.getCoords = getCoords;
  }

  updatePicture = async ctx => {
    const userId = ctx.user.dataValues.id;
    const formData = ctx.request.body;
    const filePath = formData.files.picture.path;
    try {
      const fileName = `avatar_${userId}.png`;
      const picture = await this.uploadPicture(filePath, fileName);
      await User.updateInfoById(userId, { picture: picture.Location });

      const user = await User.getInfoById(userId);

      ctx.status = 200;
      ctx.body = user;
    } catch (err) {
      ctx.throw(400, 'Invalid Input');
    }
  };

  async performances(ctx) {
    const role = getRole(ctx);

    try {
      ctx.body = await Performance.findAll({
        where: {
          [role]: ctx.user.id,
        },
        attributes: performancesAttr,
      });
    } catch (err) {
      ctx.throw(500, 'Service not Available');
    }
  }

  async userInfo(ctx) {
    const { id: actorId } = ctx.params;

    try {
      const user = await User.getInfoById(actorId, userInfoSelector);

      if (!user || user.role === 1) {
        // user does not exist or is an organizer
        ctx.throw(400, 'Not Authorized');
      }

      ctx.body = user;
    } catch (err) {
      ctx.throw(500, 'Service not Available');
    }
  }

  updateProfile = async ctx => {
    const userId = ctx.user.id;
    let {
      calendar,
      awayDays = [],
      movieGenres = [],
      ...userInfo
    } = ctx.request.body;

    const coords = await this.getCoords(userInfo.city);
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
      movieGenres = movieGenres.map(movieGenreId => ({
        movieGenreId,
        userId,
      }));

      await Promise.all([
        User.updateInfoById(userId, userInfo),
        storedCalendar
          ? Calendar.update(calendar, { where: { id: storedCalendar.id } })
          : Calendar.create({ ...calendar, userId }),
        AwayDay.bulkCreate(awayDays),
        db.connection.models.actorGenres.bulkCreate(movieGenres),
      ]);
    } catch (err) {
      ctx.throw(400, 'Invalid Input'); // in 99 % of the cases it's going to be the cause of the error, the other 1 % is db reachability issues
    }

    ctx.status = 201;
  };

  async blockUser(ctx) {
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

  async postAway(ctx) {
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

  async deleteAway(ctx) {
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
}
