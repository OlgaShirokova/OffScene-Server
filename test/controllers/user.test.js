import { expect } from 'chai';
import { AuthController, UserController } from '~/controllers';
import { userInfoSelector } from '~/selectors/user';
import db from '~/test';
const { User, Event, MusicGenre, AwayDay, Calendar } = db;

const userUpdateInfo = {
  name: 'Donkey Kong',
  picture: 'https://avatars2.githubusercontent.com/u/254565?v=3&s=460',
  calendar: {
    monday: 0,
    tuesday: 0,
    wednesday: 1,
    thursday: 0,
    friday: 1,
    saturday: 1,
    sunday: 1,
  },
  priceWe: 1000000,
  priceWd: 500000,
  city: 'Barcelona',
  musicGenres: ['rap', 'dance'],
  awayDays: ['2017-06-30T00:00:00+00:00', '2017-05-30T00:00:00+00:00'],
  bankAccount: 'ES426482984767436846874276346',
  swift: 'XF35',
};

describe('events', function() {
  let ctx;

  beforeEach(async () => {
    ctx = await createUserAndLogin();
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should return an empty list if the user its not involved in any event', async () => {
    await UserController.events(ctx);
    expect(ctx.body).to.be.an('array');
    expect(ctx.body.length).to.equal(0);
  });

  it('should return a list of events that the user is involved', async () => {
    ctx.request.body = {
      email: 'organizer@gmail.com',
      password: 'test',
      role: 1,
    };

    await AuthController.signUp(ctx);
    const organizer = await User.find({
      where: { email: ctx.request.body.email },
    });
    const event = await Event.create({
      orgId: organizer.id,
      djId: ctx.user.id,
    });

    await UserController.events(ctx);
    expect(ctx.status).to.equal(201);
    expect(ctx.body).to.be.an('array');
    expect(ctx.body.length).to.equal(1);
    expect(ctx.body[0].id).to.equal(event.id);
    expect(ctx.body[0].djId).to.equal(event.djId);
    expect(ctx.body[0].orgId).to.equal(event.orgId);
  });
});

describe('userInfo', function() {
  let ctx;

  beforeEach(async () => {
    ctx = await createUserAndLogin();
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should return information about the user requested', async () => {
    ctx.params.id = ctx.user.id;
    await UserController.userInfo(ctx);
    expect(ctx.status).to.equal(201);
    expect(ctx.body).to.be.an('object');
    expect(ctx.body.id).to.equal(ctx.user.id);
  });

  it('should throw an error if the user requested does not exist', async () => {
    ctx.params.id = 11;
    await UserController.userInfo(ctx);
    expect(ctx.body).to.equal('Service not Available');
    expect(ctx.status).to.equal(500);
  });

  it('should throw an error if the user requested its an organizer', async () => {
    ctx.request.body = {
      email: 'organizer@gmail.com',
      password: 'test',
      role: 1,
    };

    await AuthController.signUp(ctx);
    const organizer = await User.find({
      where: { email: ctx.request.body.email },
    });
    ctx.params.id = organizer.id;
    await UserController.userInfo(ctx);
    expect(ctx.status).to.equal(400);
  });
});

describe('updateProfile', function() {
  let ctx;

  beforeEach(async () => {
    ctx = await createUserAndLogin();
    await MusicGenre.create({
      name: 'rap',
    });
    await MusicGenre.create({
      name: 'dance',
    });
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should update the profile of the authenticated user with the new information provided', async () => {
    ctx.request.body = userUpdateInfo;
    await UserController.updateProfile(ctx);

    const calendarAttr = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    const user = await User.findById(ctx.user.id, {
      include: [
        { model: Calendar, attributes: calendarAttr },
        { model: AwayDay, attributes: ['date'] },
        { model: MusicGenre, attributes: ['name'] },
      ],
    });

    ctx.body = userInfoSelector(user);
    expect(ctx.status).to.equal(201);
    expect(ctx.body.name).to.equal(ctx.request.body.name);
    expect(ctx.body.picture).to.equal(ctx.request.body.picture);
    expect(ctx.body.priceWe).to.equal(ctx.request.body.priceWe);
    expect(ctx.body.priceWd).to.equal(ctx.request.body.priceWd);
    expect(ctx.body.city).to.equal(ctx.request.body.city);
    expect(ctx.body.lat).to.not.equal(null);
    expect(ctx.body.long).to.not.equal(null);
    expect(ctx.status).to.equal(201);
    expect(ctx.body.calendar.get()).to.eql(ctx.request.body.calendar);
    expect(ctx.body.musicGenres).to.include(ctx.request.body.musicGenres[0]);
  });
});

describe('blockUser', function() {
  let ctx;

  beforeEach(async () => {
    ctx = await createUserAndLogin();
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should succefully block the user specified', async () => {
    ctx.request.body = {
      email: 'organizer@gmail.com',
      password: 'test',
      role: 1,
    };

    await AuthController.signUp(ctx);
    const organizer = await User.find({
      where: { email: ctx.request.body.email },
    });
    ctx.params.id = organizer.id;
    await UserController.blockUser(ctx);
    expect(ctx.status).to.equal(201);
    const blockedUser = await db.connection.models.blockedUser.find({
      where: {
        userId: ctx.user.id,
        blockedUserId: organizer.id,
      },
    });
    expect(blockedUser).to.not.equal(null);
    expect(blockedUser.userId).to.equal(ctx.user.id);
    expect(blockedUser.blockedUserId).to.equal(organizer.id);
  });

  it('should fail without throwing errors when the authenticated user is trying to block himself', async () => {
    ctx.params.id = ctx.user.id;
    await UserController.blockUser(ctx);
    expect(ctx.status).to.equal(201);
    const blockedUser = await db.connection.models.blockedUser.find({
      where: {
        userId: ctx.user.id,
        blockedUserId: ctx.user.id,
      },
    });
    expect(blockedUser).to.equal(null);
  });

  it('should fail without throwing errors when the user to block its not an organizer', async () => {
    ctx.request.body = {
      email: 'dj@gmail.com',
      password: 'test',
      role: 0,
    };

    await AuthController.signUp(ctx);
    const dj = await User.find({
      where: { email: ctx.request.body.email },
    });
    ctx.params.id = dj.id;
    await UserController.blockUser(ctx);
    expect(ctx.status).to.equal(201);
    const blockedUser = await db.connection.models.blockedUser.find({
      where: {
        userId: ctx.user.id,
        blockedUserId: dj.id,
      },
    });
    expect(blockedUser).to.equal(null);
  });
});

describe('postAway', function() {
  let ctx;

  beforeEach(async () => {
    ctx = await createUserAndLogin();
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should create new awayDates on the authenticated user', async () => {
    ctx.request.body.awayDays = [
      '2017-06-30T00:00:00+00:00',
      '2017-07-05T00:00:00+00:00',
      '2017-07-13T00:00:00+00:00',
    ];

    await UserController.postAway(ctx);

    const awayDays = await AwayDay.findAll({
      where: { userId: ctx.user.id },
    });

    expect(awayDays.length).to.equal(3);
    awayDays.map((day, i) => {
      expect(day.date).to.eql(new Date(ctx.request.body.awayDays[i]));
      expect(day.userId).to.equal(ctx.user.id);
    });
    expect(ctx.status).to.equal(201);
  });

  it('should throw an error when awayDays is not provided', async () => {
    await UserController.postAway(ctx);
    expect(['Invalid Input', 'Service not Available']).to.include(ctx.body);
  });

  it('should throw an error when awayDays is not an array', async () => {
    ctx.request.body.awayDays = 1;
    await UserController.postAway(ctx);
    expect(['Invalid Input', 'Service not Available']).to.include(ctx.body);
  });
});

describe('deleteAway', function() {
  let ctx;

  beforeEach(async () => {
    ctx = await createUserAndLogin();
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should succefully delete the awayDays provided in the authenticated user', async () => {
    ctx.request.body = {
      awayDays: ['2017-06-30T00:00:00+00:00', '2017-05-30T00:00:00+00:00'],
    };

    await UserController.postAway(ctx);
    await UserController.deleteAway(ctx);
    const awayDays = await AwayDay.findAll({
      where: { userId: ctx.user.id },
    });
    expect(awayDays.length).to.equal(0);
    expect(ctx.status).to.equal(201);
  });

  it('should throw an error when awayDays is not provided', async () => {
    ctx.request.body = {
      awayDays: ['2017-06-30T00:00:00+00:00', '2017-05-30T00:00:00+00:00'],
    };
    await UserController.postAway(ctx);
    delete ctx.request.body.awayDays;
    await UserController.deleteAway(ctx);
    expect(['Invalid Input', 'Service not Available']).to.include(ctx.body);
  });

  it('should throw an error when awayDays is not an array', async () => {
    ctx.request.body = {
      awayDays: ['2017-06-30T00:00:00+00:00', '2017-05-30T00:00:00+00:00'],
    };
    await UserController.postAway(ctx);
    ctx.request.body.awayDays = 1;
    await UserController.deleteAway(ctx);
    expect(['Invalid Input', 'Service not Available']).to.include(ctx.body);
  });
});

function createNewContext() {
  return {
    header: {
      authorization: 'Basic dGVzdEBnbWFpbC5jb206dGVzdA==',
    },
    params: {},
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

async function createUserAndLogin() {
  const ctx = createNewContext();
  await AuthController.signUp(ctx);
  await AuthController.signIn(ctx);
  ctx.header.authorization = `Bearer ${ctx.body.authToken}`;
  await AuthController.requireAuth(ctx, () => 1);
  return ctx;
}
