import bcrypt from 'bcrypt';
const NUM_SALTS = 10;

export function encrypt(password) {
  return bcrypt.hash(password, NUM_SALTS);
}

export function isSamePassword(pass, encryptedPass) {
  return bcrypt.compare(pass, encryptedPass);
}
