import React, { createContext, useReducer, useContext } from 'react';
import KEYS from './keys';

const defaultState = {
  pageData: null,
};

interface Action {
  type: string;
  payload: object;
}

function reducer(state = defaultState, action: Action) {
  switch (action.type) {
    case KEYS.PAGE_DATA:
      return { ...state, pageData: action.payload };
    default:
      return state;
  }
}
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
