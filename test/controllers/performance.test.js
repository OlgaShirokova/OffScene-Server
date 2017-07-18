import { expect } from 'chai';
import sinon from 'sinon';
import base64 from 'base-64';
import {
  AuthController,
  PerformanceController,
  UserController,
} from '~/controllers';
import db from '~/test';
const { User, Performance } = db;

const usersController = new UserController();
const performancesController = new PerformanceController();

const city = 'Barcelona';
const coords = { lat: 41.3850639, long: 2.1734035 };
const getCoordsStub = sinon.stub();
getCoordsStub.withArgs(city).returns(coords);

const actorInfo = {
  email: 'actor@gmail.com',
  password: 'test',
  role: 0,
};

const orgInfo = {
  email: 'org@gmail.com',
  password: 'test',
  role: 1,
};

function createNewContext({
  email = 'test@gmail.com',
  password = 'test',
  role = 0,
}) {
  return {
    header: {
      authorization: `Basic ${base64.encode(email + ':' + password)}`,
    },
    params: {},
    throw(status, errMsg) {
      this.status = status;
      this.body = errMsg;
      throw 1;
    },
    body: null,
    status: null,
    request: {
      body: {
        email,
        password,
        role,
      },
    },
  };
}

async function createUserAndLogin(ctxInfo) {
  const ctx = createNewContext(ctxInfo);
  await AuthController.signUp(ctx);
  await AuthController.signIn(ctx);
  ctx.header.authorization = `Bearer ${ctx.body.authToken}`;
  await AuthController.requireAuth(ctx, () => 1);
  return ctx;
}

describe('offers', function() {
  let ctx;
  let performancesController;

  beforeEach(async () => {
    performancesController = new PerformanceController();
    performancesController.getCoords = getCoordsStub;
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should throw an error if the user performing this action is not an organizer', async () => {
    const ctx = await createUserAndLogin(actorInfo);
    try {
      await performancesController.offers(ctx);
    } catch (err) {
      expect(ctx.body).to.equal('Not Authorized');
      expect(ctx.status).to.equal(400);
    }
  });

  it('should throw an error if the city provided is not a valid city', async () => {
    let ctx = await createUserAndLogin(actorInfo);
    const actorId = ctx.user.id;
    ctx = await createUserAndLogin(orgInfo);
    ctx.request.body = {
      actorId,
      price: 8000,
      location: 'aaaaaa',
    };
    try {
      await performancesController.offers(ctx);
    } catch (err) {
      expect(ctx.body).to.equal('Invalid Input');
      expect(ctx.status).to.equal(400);
    }
  });

  it('should throw an error if the actor provided is not existent', async () => {
    const ctx = await createUserAndLogin(orgInfo);
    ctx.request.body = {
      actorId: 30,
      price: 3000,
      location: 'Madrid',
    };
    try {
      await performancesController.offers(ctx);
    } catch (err) {
      expect(ctx.body).to.equal('Invalid Input');
      expect(ctx.status).to.equal(400);
    }
  });

  it('should create the performance withouth any error', async () => {
    let ctx = await createUserAndLogin(actorInfo);
    const actorId = ctx.user.id;
    ctx = await createUserAndLogin(orgInfo);
    ctx.request.body = {
      actorId,
      price: 8000,
      location: 'Barcelona',
    };

    await performancesController.offers(ctx);

    expect(ctx.status).to.equal(201);
  });
});

describe('feedback', function() {
  let performancesController;

  beforeEach(async () => {
    performancesController = new PerformanceController();
    performancesController.getCoords = getCoordsStub;
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });
  it('should throw an error if the performance provided is not existent', async () => {
    const ctx = await createUserAndLogin(orgInfo);

    ctx.request.body = {
      performanceId: 500,
      rating: 500,
    };

    try {
      await performancesController.feedback(ctx);
    } catch (err) {
      expect(ctx.status).to.equal(400);
      expect(ctx.body).to.equal('Invalid Input');
    }
  });

  it('should throw an error if the authenticated user already provided feedback', async () => {
    let ctx = await createUserAndLogin(actorInfo);
    const actorId = await ctx.user.id;
    ctx = await createUserAndLogin(orgInfo);
    ctx.request.body = {
      actorId,
      price: 8000,
      location: 'Barcelona',
    };
    await performancesController.offers(ctx);
    const performance = await Performance.find({
      where: {
        actorId,
        orgId: ctx.user.id,
      },
    });
    ctx.request.body = {
      performanceId: performance.id,
      rating: 500,
    };
    await performancesController.feedback(ctx);
    try {
      await performancesController.feedback(ctx);
    } catch (err) {
      expect(ctx.status).to.equal(400);
      expect(ctx.body).to.equal('You already voted');
    }
  });

  it('should succefully create new feedback', async () => {
    let ctx = await createUserAndLogin(actorInfo);
    const actorId = await ctx.user.id;
    ctx = await createUserAndLogin(orgInfo);
    ctx.request.body = {
      actorId,
      price: 8000,
      location: 'Barcelona',
    };
    await performancesController.offers(ctx);
    const performance = await Performance.find({
      where: {
        actorId,
        orgId: ctx.user.id,
      },
    });
    ctx.request.body = {
      performanceId: performance.id,
      rating: 500,
    };
    await performancesController.feedback(ctx);
    expect(ctx.status).to.equal(201);
  });
});

describe('updateOffer', function() {
  let performancesController;

  beforeEach(async () => {
    performancesController = new PerformanceController();
    performancesController.getCoords = getCoordsStub;
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });
  it('should throw an error if the performance provided is not existent', async () => {
    const ctx = await createUserAndLogin(orgInfo);
    ctx.request.body = {
      performanceId: 300,
      status: 1,
    };
    try {
      await performancesController.updateOffer(ctx);
    } catch (err) {
      expect(ctx.status).to.equal(400);
      expect(ctx.body).to.equal('Not Authorized');
    }
  });

  it('should throw an error if its not the turn of the user to change the stats', async () => {
    let ctx = await createUserAndLogin(actorInfo);
    const actorId = ctx.user.id;
    ctx = await createUserAndLogin(orgInfo);
    ctx.request.body = {
      actorId,
      price: 8000,
      location: 'Barcelona',
    };

    await performancesController.offers(ctx);

    const performance = await Performance.find({
      where: {
        actorId,
        orgId: ctx.user.id,
      },
    });

    ctx.request.body = {
      performanceId: performance.id,
      status: 1,
    };

    try {
      await performancesController.feedback(ctx);
    } catch (err) {
      expect(ctx.status).to.equal(400);
      expect(ctx.body).to.equal('Not Authorized');
    }
  });

  it('should update the status of the performance succefully', async () => {
    let ctx = await createUserAndLogin(actorInfo);
    const actorId = ctx.user.id;
    ctx = await createUserAndLogin(orgInfo);
    ctx.request.body = {
      actorId,
      price: 8000,
      location: 'Barcelona',
    };

    await performancesController.offers(ctx);

    const performance = await Performance.find({
      where: {
        actorId,
        orgId: ctx.user.id,
      },
    });
    (ctx.header.authorization = `Basic ${base64.encode(
      actorInfo.email + ':' + actorInfo.password
    )}`), await AuthController.signIn(ctx);
    ctx.header.authorization = `Bearer ${ctx.body.authToken}`;
    await AuthController.requireAuth(ctx, () => 1);
    ctx.request.body = {
      performanceId: performance.id,
      status: 1,
    };
    await performancesController.feedback(ctx);
    expect(ctx.status).to.equal(201);
  });
});

describe('search', function() {
  let usersController;
  let performancesController;

  beforeEach(async () => {
    usersController = new UserController();
    usersController.getCoords = getCoordsStub;
    performancesController = new PerformanceController();
    performancesController.getCoords = getCoordsStub;
  });

  it('should return a list of actors filtered by the specified criteria', async () => {
    let ctx = await createUserAndLogin(actorInfo);

    ctx.request.body = {
      calendar: {
        monday: 0,
        tuesday: 0,
        wednesday: 1,
        thursday: 0,
        friday: 1,
        saturday: 1,
        sunday: 1,
      },
      priceWe: 3000,
      priceWd: 8000,
      city: 'Barcelona',
    };
    const actor1Id = ctx.user.id;
    await usersController.updateProfile(ctx);
    ctx = await createUserAndLogin({
      email: 'actor2@gmail.com',
      password: 'test',
      role: 0,
    });
    ctx.request.body = {
      calendar: {
        monday: 0,
        tuesday: 0,
        wednesday: 1,
        thursday: 0,
        friday: 1,
        saturday: 1,
        sunday: 1,
      },
      priceWe: 15000,
      priceWd: 20000,
      city: 'Barcelona',
    };
    await usersController.updateProfile(ctx);

    ctx = await createUserAndLogin(orgInfo);
    ctx.query = {
      priceMin: 1000,
      priceMax: 9000,
      date: 1499019327347,
      movieGenre: 'cmFwLGRhbmNl',
      city: 'Barcelona',
      maxDistance: 2000,
    };
    await performancesController.search(ctx);
    expect(ctx.body.length).to.equal(0);
  });
});
