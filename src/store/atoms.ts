import { atom } from 'recoil';
import { Node } from 'slate';
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

export const commandPluginListState = atom({
  key: KEYS.COMMAND_PLUGIN_LIST,
  default: [],
});

export interface PageData {
  meta: {
    title?: string;
    filename?: string;
  };
  block: Node[];
}

export const pageDataState = atom<PageData>({
  key: KEYS.PAGE_DATA,
  default: null,
});
