async function search(ctx) {
  ctx.body = 'search';
}

async function offers(ctx) {
  ctx.body = 'offers';
}

async function feedback(ctx) {
  ctx.body = 'feedback';
}

async function updateOffer(ctx) {
  ctx.body = 'updateOffer';
}

export default {
  search,
  offers,
  feedback,
  updateOffer,
};
