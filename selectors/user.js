import { encodeJwt } from '~/utils/jwt';
import { mutateNullToUndefined } from '~/utils/helpers';
const HALF_AN_HOUR = 1800000;

const CACHE_SIGN_IN = {};
const CACHE_USER_INFO = {};

export function signInSelector(user) {
  const inputValue = JSON.stringify(user);

  if (CACHE_SIGN_IN.hasOwnProperty(inputValue)) {
    return CACHE_SIGN_IN[inputValue];
  }

  const { email, role, staff, id } = user;

  const outputValue = {
    email,
    role,
    staff,
    ...userInfoSelector(user),
    authToken: encodeJwt(id),
  };

  CACHE_SIGN_IN[inputValue] = outputValue;

  setTimeout(() => {
    delete CACHE_SIGN_IN[inputValue];
  }, HALF_AN_HOUR);

  return outputValue;
}

export function userInfoSelector(userInfo) {
  const inputValue = JSON.stringify(userInfo);

  if (CACHE_USER_INFO.hasOwnProperty(inputValue)) {
    return CACHE_USER_INFO[inputValue];
  }

  let {
    id,
    role,
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
  } = userInfo;

  awayDays && (awayDays = awayDays.map(({ date }) => date));

  musicGenres && (musicGenres = musicGenres.map(({ name }) => name));

  const outputValue = mutateNullToUndefined({
    id,
    role,
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
  });

  CACHE_USER_INFO[inputValue] = outputValue;

  setTimeout(() => {
    delete CACHE_USER_INFO[inputValue];
  }, HALF_AN_HOUR);

  return outputValue;
}
