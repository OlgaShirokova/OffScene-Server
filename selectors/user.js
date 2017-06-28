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

export function awayDaysSelector(awayDays) {
  return awayDays.map(({ date }) => date);
}

export function genresSelector(genres) {
  return genres.map(({ musicGenreName }) => musicGenreName);
}

export function eventsSelector(events) {
  return events.map(
    ({
      orgId,
      djId,
      long,
      lat,
      location,
      price,
      orgRating,
      djRating,
      status,
      date,
      id,
    }) => ({
      orgId,
      djId,
      long,
      lat,
      location,
      price,
      orgRating,
      djRating,
      status,
      date,
      id,
    })
  );
}

// userId // WTF
// orgId
// djId
//     createdAt,
//     updatedAt,
// long
// lat
// location
// price
// orgRating
// djRating
// status
// date
// id

// id
// date
// status
// djRating
// orgRating
// price
// long
// lat
// location

// model is breaking events
