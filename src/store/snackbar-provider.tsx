import React, { createContext, useContext, useState } from 'react';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { Snackbar } from '@material-ui/core';

const SnackbarContext = createContext(null);
const defaultOption = {
  open: false,
  autoHideDuration: 6000,
};

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export function SnackbarProvider(props) {
  const [snakbarProps, setSnakbarProps] = useState(defaultOption);
  const [alertProps, setAlertProps] = useState({});

  const showAlert = (options, alert) => {
    const opts = { ...defaultOption, ...options };
    setSnakbarProps(opts);
    setAlertProps(alert);
  };
  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnakbarProps({ ...snakbarProps, open: false });
  };
  return (
    <SnackbarContext.Provider value={showAlert}>
      {props.children}
      <Snackbar {...snakbarProps} onClose={handleClose}>
        <Alert {...alertProps} onClose={handleClose} />
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => {
  const showAlert = useContext(SnackbarContext);

  return {
    success: (message, option = {}) => {
      showAlert({ ...option, open: true }, { severity: 'success', children: message });
    },
    warning: (message, option = {}) => {
      showAlert({ ...option, open: true }, { severity: 'warning', children: message });
    },
    info: (message, option = {}) => {
      showAlert({ ...option, open: true }, { severity: 'info', children: message });
    },
    error: (message, option = {}) => {
      showAlert({ ...option, open: true }, { severity: 'error', children: message });
    },
  };
};
