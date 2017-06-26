async function events(ctx) {
  ctx.body = 'events';
}

async function userInfo(ctx) {
  ctx.body = 'user-info';
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
