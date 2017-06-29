import jwt from 'jwt-simple';
import config from '~/config';
const { SECRET } = process.env.NODE_ENV === 'testing'
  ? config.testing
  : config.development;

export function encodeJwt(userId) {
  return jwt.encode({ sub: userId, iat: new Date().getTime() }, SECRET);
}

export function decodeJwt(token) {
  return jwt.decode(token, SECRET);
}
