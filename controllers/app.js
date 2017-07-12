import db from '~/models';
const { MovieGenre } = db;

async function genres(ctx) {
  const inputField = ctx.request.url;
  const query = inputField.split('=')[1];

  try {
    const genres = await MovieGenre.findAll({
      where: {
        name: { $like: '%' + query + '%' },
      },
    });
    ctx.body = genres.map(el => el.name);
    ctx.status = 200;
  } catch (err) {
    ctx.throw(500, 'Service not Available');
  }
}

export default {
  genres,
};
