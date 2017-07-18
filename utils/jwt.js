import jwt from 'jwt-simple';
import nconf from '~/config/nconf';
const SECRET = nconf.get('SECRET');

export function encodeJwt(userId) {
  return jwt.encode({ sub: userId, iat: new Date().getTime() }, SECRET);
}

export function decodeJwt(token) {
  return jwt.decode(token, SECRET);
}
