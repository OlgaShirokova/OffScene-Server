import { encodeJwt } from '~/utils/jwt';

export function signInSelector(user, token) {
  const { password, bankAccount, swift, ...userInfo } = user;

  return {
    ...userInfo,
    authToken: encodeJwt(userInfo.id),
  };
}
