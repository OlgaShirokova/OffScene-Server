import db from '~/models';
const { User, AwayDay } = db;
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

  const user = await User.findOne({
    where: {
      email,
    },
    include: [AwayDay],
  });

  if (!user) {
    ctx.throw(400, 'Incorrect credentials');
  }

  const isEqual = await isSamePasswordAsync(password, user.get().password);

  if (!isEqual) {
    ctx.throw(400, 'Incorrect credentials');
  }

  ctx.body = signInSelector(user.get());
}

async function signUp(ctx) {
  let { email, password, role } = ctx.request.body;

  const user = await User.findOne({
    where: { email: email },
  });

  if (user) {
    ctx.throw(400, 'Username already exist');
  }

  await User.create({ email, password, role });

  ctx.status = 201;
}

async function requireAuth(ctx, next) {
  const token = ctx.headers.authorization;

  if (!token) {
    ctx.throw(400, 'Not Authorized');
  }

  try {
    const { sub: userId, iat } = decodeJwt(token.split(' ')[1]);

    if (new Date().getTime() - iat >= TOKEN_EXPIRATION_DATE) {
      ctx.throw(400, 'Not Authorized');
    }

    const user = await User.findById(userId);

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
