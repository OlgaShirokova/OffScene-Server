import db from '~/models';
import { userInfoSelector } from '~/selectors/user';
const { User, Calendar, AwayDay, MusicGenre } = db;

async function events(ctx) {
  ctx.body = 'events';
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

  user.dataValues.genres = genres ? genres : [];

  ctx.body = userInfoSelector(user.get());
}

async function profile(ctx) {
  ctx.body = 'profile';
}

async function profilePicture(ctx) {
  ctx.body = 'profile-picture';
}

async function blockUser(ctx) {
  ctx.body = 'block-user';
}

async function postAway(ctx) {
  ctx.body = 'away-post';
}

async function deleteAway(ctx) {
  ctx.body = 'away-delete';
}

export default {
  events,
  userInfo,
  profile,
  profilePicture,
  blockUser,
  postAway,
  deleteAway,
};
