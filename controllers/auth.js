import db from '~/models';
const { User, AwayDay } = db;
import { encrypt, isSamePassword } from '~/utils/bcrypt';
import { decode } from '~/utils/jwt';
import { getCredentials } from '~/utils/base64';
import { signInInfo } from '~/selectors/user';

async function signIn(ctx) {
  const encodedUserCreds = ctx.header.authorization;
  if (!encodedUserCreds) {
    ctx.status = 400;
    return (ctx.body = { errors: ['Incorrent credentials'] });
  }

  const { email, password } = getCredentials(encodedUserCreds);

  const user = await User.findOne({
    where: {
      email: email,
    },
    include: [AwayDay],
  });

  if (!user) {
    ctx.status = 400;
    return (ctx.body = {
      errors: ['Incorrent credentials'],
    });
  }

  const isEqual = await isSamePassword(password, user.get().password);

  if (!isEqual) {
    ctx.status = 400;
    return (ctx.body = {
      errors: ['Incorrent credentials'],
    });
  }

  ctx.body = signInInfo(user.get());
}

async function signUp(ctx) {
  let { email, password, role } = ctx.request.body;

  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  if (user) {
    ctx.status = 400;
    return (ctx.body = {
      errors: ['Username already exists.'],
    });
  }

  password = await encrypt(password);
  await User.create({ email, password, role });

  ctx.status = 201;
}

async function requireAuth(ctx, next) {
  const token = ctx.headers.authorization;
  if (!token) {
    ctx.status = 400;
    return (ctx.body = { errors: ['Not Authorized'] });
  }

  try {
    const { sub: userId } = decode(token.split(' ')[1]);
    const user = await User.findById(userId);
    if (!user) {
      ctx.status = 400;
      return (ctx.body = { errors: ['Not Authorized'] });
    }
  } catch (err) {
    ctx.status = 400;
    return (ctx.body = { errors: ['Not Authorized'] });
  }
  return await next();
}

export default { signIn, signUp, requireAuth };
