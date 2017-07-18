import bcrypt from 'bcrypt';
const NUM_SALTS = 10;

export function encryptAsync(password) {
  return bcrypt.hash(password, NUM_SALTS);
}

export function isSamePasswordAsync(pass, encryptedPass) {
  return bcrypt.compare(pass, encryptedPass);
}
