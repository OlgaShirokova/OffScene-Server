import { encodeJwt } from '~/utils/jwt';

export function signInSelector(user) {
  const {
    password,
    bankAccount,
    swift,
    createdAt,
    updatedAt,
    ...userInfo
  } = user;

  return {
    ...userInfo,
    authToken: encodeJwt(userInfo.id),
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
    calendar,
    priceWe,
    priceWd,
    city,
    avgRating,
    musicGenres: musicGenres.map(({ name }) => name),
    awayDays: awayDays.map(({ date }) => date),
  };
}
