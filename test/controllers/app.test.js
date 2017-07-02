import { expect } from 'chai';
import { AuthController, UserController, AppController } from '~/controllers';
import db from '~/test';
const { User, Event, MusicGenre, AwayDay, Calendar } = db;

const musicInput = {
  request: {
    method: 'GET',
    url: '/genres?startWith=ele',
    header: {
      host: 'localhost:3000',
      connection: 'keep-alive',
      'cache-control': 'no-cache',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
      'postman-token': '85ccb589-f2c7-2e2c-1a6b-f5bf64708fd0',
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'es-ES,es;q=0.8,ru;q=0.6',
    },
  },
  response: { status: 404, message: 'Not Found', header: {} },
  app: { subdomainOffset: 2, proxy: false, env: 'development' },
  originalUrl: '/genres?startWith=techno',
  req: '<original node req>',
  res: '<original node res>',
  socket: '<original node socket>',
};

describe('autocompleteMusicGenres', function() {
  let ctx;

  beforeEach(async () => {
    await MusicGenre.create({
      name: 'electro',
    });
    await MusicGenre.create({
      name: 'hard hop',
    });
  });

  afterEach(async () => {
    await db.connection.sync({ logging: false, force: true });
  });

  it('should show the matching music genres', async () => {
    ctx = musicInput;
    await AppController.genres(ctx);

    const response = 'electro';
    expect(ctx.status).to.equal(200);
    expect(ctx.body.includes(response)).to.eql(true);
    expect(ctx.body).to.be.a('array');
  });
});
