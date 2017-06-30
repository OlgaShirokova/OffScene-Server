import db from '~/models';
const { MusicGenre } = db;

async function genres(ctx) {
  const inputField = ctx.request.url;
  const query = inputField.split('=')[1];

  try {
    console.log(query);
    const genres = await MusicGenre.findAll({
      where: {
        name: { $like: '%' + query + '%' },
      },
    });
    ctx.body = genres.map(el => el.name);
  } catch (err) {
    ctx.throw(500, 'Service not Available');
  }
}

export default {
  genres,
};
