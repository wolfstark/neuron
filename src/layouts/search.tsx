import {
  Fade,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popover,
  Popper,
} from '@material-ui/core';
import { makeStyles, fade } from '@material-ui/core/styles';
import { Search } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { fileListState } from '@/store/atoms';
import rendererIpc from '@/utils/rendererIpc';

const useStyles = makeStyles((theme) => ({
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

export default function TheSearch() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterList, setFilterList] = useState([]);
  console.log('🚀 ~ file: Search.tsx ~ line 64 ~ TheSearch ~ filterList', filterList);
  const [inputVal, setInputVal] = useState('');

  const [fileList, setFileList] = useRecoilState(fileListState);
  console.log('🚀 ~ file: index.tsx ~ line 192 ~ Layout ~ fileList', fileList);
  useEffect(() => {
    const updatelistHandle = (e, filelist) => {
      setFileList(filelist);
    };
    rendererIpc.receiveFromMain.addListener('update-file-list', updatelistHandle);
    return () => {
      rendererIpc.receiveFromMain.removeListener('update-file-list', updatelistHandle);
    };
  }, [setFileList]);

  useEffect(() => {
    rendererIpc.sendToMain('getLocalfile');
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(event.target.value);
    setFilterList(fileList.filter((file) => file.title.indexOf(event.target.value) !== -1));
  };

  const open = Boolean(anchorEl);

  const newPage = () => {
    rendererIpc.sendToMain('new-page', inputVal);
    setInputVal('');
  };

  return (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <Search />
      </div>
      <InputBase
        value={inputVal}
        placeholder="Search…"
        onClick={handleClick}
        onChange={handleChange}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{
          'aria-label': 'search',
        }}
      />
      {inputVal && (
        <Popper
          open={open}
          anchorEl={anchorEl}
          // onClose={handleClose}
          transition
          placement="bottom"
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper>
                <List>
                  <ListItem button key="new" onClick={newPage}>
                    <ListItemText
                      primary={`新建页面：'${inputVal}'`}
                      // secondary={secondary ? 'Secondary text' : null}
                    />
                  </ListItem>
                  {filterList.map((file) => (
                    <ListItem key={file.title} button>
                      <ListItemText
                        primary={file.title}
                        // secondary={secondary ? 'Secondary text' : null}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Fade>
          )}
        </Popper>
      )}
    </div>
  );
}