import jwt from 'jwt-simple';
import config from '~/config';
const { SECRET } = config.development;

export function encode(userId) {
  return jwt.encode({ sub: userId, iat: new Date().getTime() }, SECRET);
}

export function decode(token) {
  return jwt.decode(token, SECRET);
}
