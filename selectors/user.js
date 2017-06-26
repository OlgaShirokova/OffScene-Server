import { encode, decode } from '~/utils/jwt';

export function signInInfo(user, token) {
  const { password, bankAccount, swift, ...userInfo } = user;

  return {
    ...userInfo,
    authToken: encode(userInfo.id),
  };
}
