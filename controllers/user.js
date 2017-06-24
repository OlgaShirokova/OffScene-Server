async function signIn(ctx) {
  ctx.body = 'sign-in';
}

async function events(ctx) {
  ctx.body = 'events';
}

async function userInfo(ctx) {
  ctx.body = 'user-info';
}

async function signUp(ctx) {
  ctx.body = 'sign-up';
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

const away = {
  async post(ctx) {
    ctx.body = 'away-post';
  },
  async delete(ctx) {
    ctx.body = 'away-delete';
  },
};

export default {
  signIn,
  events,
  userInfo,
  signUp,
  profile,
  profilePicture,
  blockUser,
  away,
};
