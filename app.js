import Koa from 'koa';
import koaBody from 'koa-body';
import logger from 'koa-logger';
import routes from '~/routes';
import { errorHandling } from '~/middlewares';

new Koa()
  .use(koaBody({ strict: false }))
  .use(logger())
  .use(errorHandling)
  .use(routes)
  .listen(3000);
