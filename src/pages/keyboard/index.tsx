import React, { useMemo, useRef } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Button, Paper } from '@material-ui/core';
import ReactCodeMirror from '@/components/ReactCodeMirror';
import { useStore } from '@/store/reducer-provider';
import jsonlint from 'jsonlint-mod';
import rendererIpc from '@/utils/rendererIpc';
import { useSnackbar } from '@/store/snackbar-provider';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
  }),
);
export default function Page(props) {
  const classes = useStyles();
  const { userKeyboard } = useStore();
  const ref = useRef(null);
  const { success, warning } = useSnackbar();

  const saveHandle = () => {
    const val = ref.current.editor.getValue();
    try {
      jsonlint.parse(val);
      rendererIpc.invoke('updateKeyboard', val);
      success('保存成功');
    } catch (error) {
      warning('保存失败');
    }
  };
  return (
    <Paper>
      <ReactCodeMirror value={userKeyboard?.settingStr} ref={ref} />
      <Button onClick={saveHandle}>保存</Button>
    </Paper>
  );
}
