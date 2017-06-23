import Koa from 'koa';
import koaBody from 'koa-body';
import logger from 'koa-logger';

new Koa().use(koaBody()).use(logger()).listen(3000);
