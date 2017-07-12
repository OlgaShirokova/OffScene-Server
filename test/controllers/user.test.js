import { expect } from 'chai';
import sinon from 'sinon';
import { AuthController, UserController } from '~/controllers';
import { userInfoSelector } from '~/selectors/user';
import db from '~/test';
const { User, Event, MovieGenre, AwayDay, Calendar } = db;

const usersController = new UserController();

const city = 'Barcelona';
const coords = { lat: 41.3850639, long: 2.1734035 };
const getCoordsStub = sinon.stub();
getCoordsStub.withArgs(city).returns(coords);

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
  movieGenres: ['rap', 'dance'],
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
    await usersController.events(ctx);
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

    await usersController.events(ctx);
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
    await usersController.userInfo(ctx);
    expect(ctx.status).to.equal(201);
    expect(ctx.body).to.be.an('object');
    expect(ctx.body.id).to.equal(ctx.user.id);
  });

  it('should throw an error if the user requested does not exist', async () => {
    ctx.params.id = 11;
    await usersController.userInfo(ctx);
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
    await usersController.userInfo(ctx);
    expect(ctx.status).to.equal(400);
  });
});

describe('updateProfile', function() {
  let ctx;
  let usersController;

  beforeEach(async () => {
    ctx = await createUserAndLogin();
    usersController = new UserController();
    usersController.getCoords = getCoordsStub;
    await MovieGenre.create({
      name: 'rap',
    });
    await MovieGenre.create({
      name: 'dance',
    });
    await db.connection.models.djGenres.bulkCreate([
      {
        movieGenreId: '1',
        userId: ctx.body.id,
      },
      {
        movieGenreId: '2',
        userId: ctx.body.id,
      },
    ]);
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should update the profile of the authenticated user with the new information provided', async () => {
    ctx.request.body = userUpdateInfo;
    await usersController.updateProfile(ctx);

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
        { model: MovieGenre, attributes: ['id', 'name'] },
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
    expect(ctx.body.calendar.get()).to.eql(ctx.request.body.calendar);
    expect(ctx.body.movieGenres[0].name).to.equal(
      ctx.request.body.movieGenres[0]
    );
  });
});

const requestPicture = {
  method: 'POST',
  url: '/picture',
  header: {
    host: 'localhost:3000',
    connection: 'keep-alive',
    'content-length': '389899',
    authorization:
      'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImlhdCI6MTQ5ODY3NjcxNjM0MX0.7DrFWuB7IGor4DY2lEo0AoI6COEiV_-h-4uORRZalNY',
    'postman-token': '7b4ec96f-3fcb-f78e-dfee-9f5cc7922303',
    'cache-control': 'no-cache',
    origin: 'chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
    'content-type':
      'multipart/form-data; boundary=----WebKitFormBoundaryT0X8uEqAsqBhalJu',
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'es-ES,es;q=0.8,ru;q=0.6',
  },
  body: {
    fields: {},
    files: {
      picture: {
        domain: null,
        _events: {},
        _eventsCount: 0,
        _maxListeners: undefined,
        size: 389715,
        path:
          '/var/folders/rx/8thfqchn0gq1wlh74ht9z7x00000gn/T/upload_dc3e814db4606d6e05f730b016f',
        name: 'meme.png',
        type: 'image/png',
        hash: null,
        lastModifiedDate: new Date('2017-07-04T08:17:22.364Z'),
        _writeStream: null,
      },
    },
  },
};
const picture = {
  ETag: '"7e766504197a141193b7ff9141919037"',
  Location: 'https://offstage.s3.amazonaws.com/avatar_1.png',
  key: 'avatar_1.png',
  Key: 'avatar_1.png',
  Bucket: 'offstage',
};
const path =
  '/var/folders/rx/8thfqchn0gq1wlh74ht9z7x00000gn/T/upload_dc3e814db4606d6e05f730b016f';
const name = 'avatar_1.png';
const uploadPictureStub = sinon.stub();
uploadPictureStub.withArgs(path, name).returns(picture);

describe('updatePicture', function() {
  let ctx;
  let usersController;

  beforeEach(async () => {
    ctx = await createUserAndLogin();
    usersController = new UserController();
    usersController.uploadPicture = uploadPictureStub;
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should update the profile of the authenticated user with the new picture provided', async () => {
    ctx.request = requestPicture;
    await usersController.updatePicture(ctx);

    const user = await User.findById(ctx.user.id);

    const pictureResp = 'https://offstage.s3.amazonaws.com/avatar_1.png';

    ctx.body = userInfoSelector(user);
    expect(ctx.status).to.equal(200);
    expect(ctx.body.picture).to.equal(pictureResp);
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
    await usersController.blockUser(ctx);
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
    await usersController.blockUser(ctx);
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
    await usersController.blockUser(ctx);
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

    await usersController.postAway(ctx);

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
    await usersController.postAway(ctx);
    expect(['Invalid Input', 'Service not Available']).to.include(ctx.body);
  });

  it('should throw an error when awayDays is not an array', async () => {
    ctx.request.body.awayDays = 1;
    await usersController.postAway(ctx);
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

    await usersController.postAway(ctx);
    await usersController.deleteAway(ctx);
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
    await usersController.postAway(ctx);
    delete ctx.request.body.awayDays;
    await usersController.deleteAway(ctx);
    expect(['Invalid Input', 'Service not Available']).to.include(ctx.body);
  });

  it('should throw an error when awayDays is not an array', async () => {
    ctx.request.body = {
      awayDays: ['2017-06-30T00:00:00+00:00', '2017-05-30T00:00:00+00:00'],
    };
    await usersController.postAway(ctx);
    ctx.request.body.awayDays = 1;
    await usersController.deleteAway(ctx);
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
