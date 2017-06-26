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

export function userInfoSelector(user) {
  let {
    password,
    bankAccount,
    swift,
    email,
    staff,
    createdAt,
    updatedAt,
    role,
    ...userInfo
  } = user;

  userInfo.awayDays = awayDaysSelector(userInfo.awayDays);

  userInfo.genres = genresSelector(userInfo.genres);

  return userInfo;
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
