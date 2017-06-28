export default async function errorHandling(ctx, next) {
  try {
    await next();
  } catch ({ message, status }) {
    ctx.status = status;
    ctx.body = { errors: [message] };
  }
}
