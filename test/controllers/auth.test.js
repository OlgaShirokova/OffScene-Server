import { expect } from 'chai';
import jwt from 'jwt-simple';
import { AuthController } from '~/controllers';
import db from '~/test';
import { encodeJwt, decodeJwt } from '~/utils/jwt';
import config from '~/config';
const { User } = db;

describe('signUp', function() {
  let ctx;

  beforeEach(() => {
    ctx = createNewContext();
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should succed if an user with the provided email does not exist', async () => {
    await AuthController.signUp(ctx);
    const user = await User.find({
      where: {
        email: ctx.request.body.email,
      },
    });
    expect(user).to.be.an('object');
    expect(user.email).to.equal(ctx.request.body.email);
    expect(user.role).to.equal(ctx.request.body.role);
    expect(user.password).to.be.an('string');
    expect(ctx.status).to.equal(201);
  });

  it('should throw an error if an user with the provided email already exists', async () => {
    await AuthController.signUp(ctx);

    try {
      await AuthController.signUp(ctx);
    } catch (err) {
      expect(ctx.body).to.equal(
        'A user is already registered with this email.'
      );
      expect(ctx.status).to.equal(400);
    }
  });
});

describe('signIn', function() {
  let ctx;

  beforeEach(() => {
    ctx = createNewContext();
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should succeed if the credentials gived are valid', async () => {
    await AuthController.signUp(ctx);
    await AuthController.signIn(ctx);
    expect(ctx.status).to.equal(201);
    expect(ctx.body).to.be.an('object');
    expect(ctx.body.email).to.equal(ctx.request.body.email);
    expect(ctx.body.role).to.equal(ctx.request.body.role);
  });

  it('should throw an error if the user does not exist', async () => {
    try {
      await AuthController.signIn(ctx);
    } catch (err) {
      expect(ctx.status).to.equal(400);
      expect(ctx.body).to.equal('Incorrect credentials');
    }
  });

  it('should throw an error if the password its incorrect', async () => {
    await AuthController.signUp(ctx);
    ctx.request.body.password = 'test2';
    try {
      await AuthController.signIn(ctx);
    } catch (err) {
      expect(ctx.status).to.equal(201);
      expect(ctx.body).to.equal('Incorrect credentials');
    }
  });
});

describe('requireAuth', function() {
  let ctx;

  beforeEach(() => {
    ctx = createNewContext();
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should not throw any error if the token provided is valid', async () => {
    await AuthController.signUp(ctx);
    await AuthController.signIn(ctx);
    ctx.header.authorization = `Bearer ${ctx.body.authToken}`;
    await AuthController.requireAuth(ctx, () => 1);
    expect(ctx.status).to.equal(201);
  });
  it('should throw an error when there is no token provided', async () => {
    await AuthController.requireAuth(ctx, () => 1);
    expect(ctx.status).to.equal(400);
    expect(ctx.body).to.equal('Not Authorized');
  });

  it('should throw an error when the token provided is expired', async () => {
    await AuthController.signUp(ctx);
    const user = await User.find({
      where: { email: ctx.request.body.email },
    });

    const token = `Bearer ${jwt.encode(
      { sub: user.id, iat: new Date(1).getTime() },
      config.testing.SECRET
    )}`;
    ctx.header.authorization = token;
    await AuthController.requireAuth(ctx, () => 1);
    expect(ctx.status).to.equal(400);
    expect(ctx.body).to.equal('Not Authorized');
  });

  it('should throw an error when the token provided is not valid', async () => {
    ctx.header.authorization = 'test';
    await AuthController.requireAuth(ctx, () => 1);
    expect(ctx.status).to.equal(400);
    expect(ctx.body).to.equal('Not Authorized');
  });
});

function createNewContext() {
  return {
    header: {
      authorization: 'Basic dGVzdEBnbWFpbC5jb206dGVzdA==',
    },
    throw(status, errMsg) {
      this.status = status;
      this.body = errMsg;
    },
    body: null,
    status: null,
    request: {
      body: {
        email: 'test@gmail.com',
        password: 'test',
        role: 0,
      },
    },
  };
}
