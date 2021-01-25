import { IconButton } from '@material-ui/core';
import React from 'react';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { makeStyles } from '@material-ui/core/styles';
import rendererIpc from '@/utils/rendererIpc';
import { useRecoilState } from 'recoil';
import { pageDataState } from '@/store/atoms';
import { useStore } from '@/store/reducer-provider';

const useStyles = makeStyles({
  root: {
    backgroundColor: 'red',
  },
});

export default function ExportBtn(props) {
  const classes = useStyles(props);
  // const [pageData, setPageData] = useRecoilState(pageDataState);
  const { pageData } = useStore();

  const handleExportMD = () => {
    rendererIpc.sendToMain('exportMD', pageData.meta.filename);
  };
  return (
    <div>
      <IconButton
        color="inherit"
        onClick={handleExportMD}
        // edge="start"
      >
        <ExitToAppIcon />
      </IconButton>
    </div>
  );
}
