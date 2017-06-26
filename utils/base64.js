import base64 from 'base-64';

export function getCredentials(b64token) {
  const [email, password] = base64.decode(b64token.split(' ')[1]).split(':');
  return {
    email,
    password,
  };
}
