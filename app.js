import Koa from 'koa';
import koaBody from 'koa-body';
import logger from 'koa-logger';
import routes from '~/routes';
import cors from 'koa2-cors';
import { errorHandling } from '~/middlewares';

new Koa()
  .use(cors())
  .use(
    koaBody({
      strict: false,
      multipart: true,
      formLimit: '1mb',
    })
  )
  .use(logger())
  .use(errorHandling)
  .use(routes)
  .listen(8000);
