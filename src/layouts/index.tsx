import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme, fade } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import 'fontsource-roboto';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'tippy.js/dist/tippy.css';
import { NavLink } from 'umi';
import { LinkProps } from 'react-router-dom';
import { RecoilRoot, useRecoilState, useRecoilSnapshot } from 'recoil';
import rendererIpc from '@/utils/rendererIpc';
import {
  editorPluginListState,
  fileListState,
  pluginListState,
  commandPluginListState,
} from '@/store/atoms';
import TheSearch from './search';
import PluginPackage from '@/utils/plugin-package';
import Api from '@/utils/api';
import ExportBtn from './exportBtn';
import { StoreProvider } from '@/store/reducer-provider';
import UserConfig from '@/utils/UserConfig';
import { useStore, useDispatch } from '@/store/reducer-provider';
import { types } from 'util';
import KEYS from '@/store/keys';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));
interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
}

function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<LinkProps, 'to'>>((itemProps, ref) => (
        <NavLink to={to} ref={ref} {...itemProps} />
      )),
    [to],
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

function DebugObserver() {
  const snapshot = useRecoilSnapshot();
  useEffect(() => {
    console.debug('The following atoms were modified:');
    // eslint-disable-next-line no-restricted-syntax
    for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      console.debug(node.key, snapshot.getLoadable(node));
    }
  }, [snapshot]);

  return null;
}

function Layout({ children }) {
  const classes = useStyles();
  // const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [fileList, setFileList] = useRecoilState(fileListState);
  const [pluginList, setPluginList] = useRecoilState(pluginListState);
  const [slatePluginList, setSlatePluginList] = useRecoilState(editorPluginListState);
  const [commandList, setCommandList] = useRecoilState(commandPluginListState);
  // const [boostList, setBoostList] = useState([]);
  const { userConfig } = useStore();
  // const userConfig = new UserConfig();
  const dispatch = useDispatch();

  useEffect(() => {
    const updatePluginHandle = (e, pluginlist) => {
      const pluginPackageList = [...pluginList];
      const uninstallPlugins = [];
      pluginlist.forEach((pluginConfig) => {
        const index = pluginList.findIndex((pluginWrap: PluginPackage) => {
          return pluginWrap.isSame(pluginConfig);
        });
        if (index > -1) {
          const targetPluginPackage: PluginPackage = pluginList[index];
          const pluginPackage = new PluginPackage(
            pluginConfig,
            targetPluginPackage.getApi(),
            userConfig,
          );

          if (!pluginConfig.pkg.enable && targetPluginPackage.config.pkg.enable) {
            pluginPackageList.splice(index, 1, pluginPackage);
          } else if (pluginConfig.pkg.enable && !targetPluginPackage.config.pkg.enable) {
            pluginPackageList.splice(index, 1, pluginPackage);
          }
          // todo sometings
        } else {
          uninstallPlugins.push(
            new PluginPackage(
              pluginConfig,
              new Api(setSlatePluginList, setCommandList),
              userConfig,
            ),
          );
        }
      });
      setPluginList([...pluginPackageList, ...uninstallPlugins]);
    };
    rendererIpc.receiveFromMain.addListener('update-plugin-list', updatePluginHandle);
    return () => {
      rendererIpc.receiveFromMain.removeListener('update-plugin-list', updatePluginHandle);
    };
  }, [setPluginList, pluginList, userConfig, setSlatePluginList, setCommandList]);

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
    const updateSettingHandle = (e, setting) => {
      dispatch({ type: KEYS.USER_CONFIG, payload: new UserConfig(setting) });
    };
    rendererIpc.receiveFromMain.addListener('update-setting', updateSettingHandle);

    return () => {
      rendererIpc.receiveFromMain.removeListener('update-setting', updateSettingHandle);
    };
  }, [dispatch]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    rendererIpc.sendToMain('getLocalfile');
  }, []);

  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
        <AppBar
          position="fixed"
          color="default"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar variant="dense">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title} noWrap>
              {/* Persistent drawer */}
            </Typography>
            <TheSearch />
            <ExportBtn />
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItemLink to="/list" primary="Inbox" icon={<InboxIcon />} />
            <ListItemLink to="/plugins" primary="Plugins" icon={<InboxIcon />} />
          </List>
        </Drawer>
        <main
          className={clsx(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          <div className={classes.drawerHeader} />
          {children}
        </main>
      </div>
    </>
  );
}
export default function RecoilWrapper({ children }) {
  return (
    <StoreProvider>
      <RecoilRoot>
        <DebugObserver />
        <Layout>{children}</Layout>
      </RecoilRoot>
    </StoreProvider>
  );
}
