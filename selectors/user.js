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
  awayDays = awayDays ? awayDays.map(({ date }) => date) : undefined;

  musicGenres = musicGenres ? musicGenres.map(({ name }) => name) : undefined;

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
    awayDays,
    musicGenres,
  };
}
