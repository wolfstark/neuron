import React, { createContext, useReducer, useContext } from 'react';
import { createReducer } from '@reduxjs/toolkit';
import KEYS from './keys';

const defaultState = {
  pageData: null,
  userConfig: null,
};

// interface Action {
//   type: string;
//   payload: object;
// }

const reducer = createReducer(defaultState, {
  [KEYS.PAGE_DATA]: (state, action) => ({ ...state, pageData: action.payload }),
  [KEYS.USER_CONFIG]: (state, action) => ({ ...state, userConfig: action.payload }),
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
export const useStore = () => useContext(StoreContext);
