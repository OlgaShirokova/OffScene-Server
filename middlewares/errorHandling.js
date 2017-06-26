export default async function errorHandling(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.body = undefined;
    switch (ctx.status) {
      case 401:
        ctx.app.emit('error', err, this);
        break;
      default:
        if (err.message) {
          ctx.body = { errors: [err.message] };
        }
        ctx.app.emit('error', err, this);
    }
  }
}
