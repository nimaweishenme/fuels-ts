import { scrypt, keccak256 } from '../shared';
import type { CryptoApi } from '../types';

import { bufferFromString, stringFromBuffer, decrypt, encrypt, keyFromPassword } from './aes-ctr';
import { randomBytes } from './randomBytes';

const api: CryptoApi = {
  bufferFromString,
  stringFromBuffer,
  decrypt,
  encrypt,
  keyFromPassword,
  randomBytes,
  scrypt,
  keccak256,
};

export default api;
