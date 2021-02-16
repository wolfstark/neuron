import React, { createContext, useReducer, useContext } from 'react';
// import { createReducer } from '@reduxjs/toolkit';
import KEYS from './keys';

const defaultState = {
  pageData: null,
  userConfig: null,
  commands: null,
  userKeyboard: null,
  editor: null,
  pluginList: [],
  fileList: [],
  commandList: [],
};

const createReducer = (initState, mapObject) => {
  return (state = initState, action) => {
    // const keys = Object.keys(map);
    // const callback = action.type
    const callback = mapObject[action.type];
    if (callback) {
      return callback(state, action);
    }
    throw new Error();
  };
};
/**
 *  import { createReducer } from '@reduxjs/toolkit' 不可变数据
 */
const reducer = createReducer(defaultState, {
  [KEYS.PAGE_DATA]: (state, action) => ({ ...state, pageData: action.payload }),
  [KEYS.EDITOR]: (state, action) => ({ ...state, editor: action.payload }),
  [KEYS.USER_CONFIG]: (state, action) => ({ ...state, userConfig: action.payload }),
  [KEYS.PLUGIN_LIST]: (state, action) => ({ ...state, pluginList: action.payload }),
  [KEYS.USER_KEYBOARD]: (state, action) => ({ ...state, userKeyboard: action.payload }),
  [KEYS.COMMANDS]: (state, action) => ({ ...state, commands: action.payload }),
  [KEYS.FILE_LIST]: (state, action) => ({ ...state, fileList: action.payload }),
  [KEYS.COMMAND_PLUGIN_LIST]: (state, action) => ({ ...state, commandList: action.payload }),
});

const DispatchContext = createContext(null);
const StoreContext = createContext(null);

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StoreContext.Provider value={state}>{props.children}</StoreContext.Provider>
    </DispatchContext.Provider>
  );
}

export const useDispatch = () => useContext(DispatchContext);
export const useStore = () => useContext(StoreContext) as typeof defaultState;
