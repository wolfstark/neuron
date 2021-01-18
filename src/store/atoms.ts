import { atom } from 'recoil';
import KEYS from './keys';

export const fileListState = atom({
  key: KEYS.FILE_LIST,
  default: [],
});
export const pluginListState = atom({
  key: KEYS.PLUGIN_LIST,
  default: [],
});
export const editorPluginListState = atom({
  key: KEYS.EDITOR_PLUGIN_LIST,
  default: [],
});
