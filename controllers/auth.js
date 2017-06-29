import db from '~/models';
const { User, AwayDay, Calendar, MusicGenre } = db;
import { encryptAsync, isSamePasswordAsync } from '~/utils/bcrypt';
import { decodeJwt } from '~/utils/jwt';
import { getCredentials } from '~/utils/base64';
import { signInSelector } from '~/selectors/user';
const TOKEN_EXPIRATION_DATE = 2.628e9; // 1 month in milliseconds

async function signIn(ctx) {
  const b64EncodedUserCreds = ctx.header.authorization;

  if (!b64EncodedUserCreds) {
    ctx.throw(400, 'Incorrect credentials');
  }

  const { email, password } = getCredentials(b64EncodedUserCreds);

  const calendarAttr = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const user = await User.findOne({
    where: {
      email,
    },
    include: [
      { model: Calendar, attributes: calendarAttr },
      { model: AwayDay, attributes: ['date'] },
      { model: MusicGenre, attributes: ['name'] },
    ],
  });

  if (!user) {
    ctx.throw(400, 'Incorrect credentials');
  }

  const isEqual = await isSamePasswordAsync(password, user.password);

  if (!isEqual) {
    ctx.throw(400, 'Incorrect credentials');
  }
  ctx.body = signInSelector(user);
}

async function signUp(ctx) {
  let { email, password, role } = ctx.request.body;

  const user = await User.findOne({
    where: { email: email },
  });

  if (user) {
    ctx.throw(400, 'A user is already registered with this email.');
  }

  await User.create({ email, password, role });

  ctx.status = 201;
}

async function requireAuth(ctx, next) {
  const token = ctx.header.authorization;

  if (!token) {
    ctx.throw(400, 'Not Authorized');
  }

  try {
    const { sub: userId, iat } = decodeJwt(token.split(' ')[1]);

    if (new Date().getTime() - iat >= TOKEN_EXPIRATION_DATE) {
      ctx.throw(400, 'Not Authorized');
    }

    const user = await User.findById(userId, {
      attributes: ['id', 'role', 'staff'],
    });

    if (!user) {
      ctx.throw(400, 'Not Authorized');
    }

    ctx.user = user;
  } catch (err) {
    ctx.throw(400, 'Not Authorized');
  }

  await next();
}

export default { signIn, signUp, requireAuth };
