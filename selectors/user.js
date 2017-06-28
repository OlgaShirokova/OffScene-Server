import { encodeJwt } from '~/utils/jwt';

export function signInSelector(user) {
  const { email, role, staff, id } = user;
  return {
    email,
    role,
    staff,
    ...userInfoSelector(user),
    authToken: encodeJwt(id),
  };
}

export function userInfoSelector({
  id,
  name,
  picture,
  priceWe,
  priceWd,
  city,
  lat,
  long,
  avgRating,
  calendar,
  awayDays,
  musicGenres,
}) {
  return {
    id,
    name,
    picture,
    priceWe,
    priceWd,
    city,
    lat,
    long,
    avgRating,
    calendar,
    awayDays: awayDays.map(({ date }) => date),
    musicGenres: musicGenres.map(({ name }) => name),
  };
}
