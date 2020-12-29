import { atom } from 'recoil';
import KEYS from './keys';

export const fileListState = atom({
  key: KEYS.FILE_LIST,
  default: [],
});
