import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
} from '@material-ui/core';
import { Wifi } from '@material-ui/icons';
import { useRecoilState } from 'recoil';
import { pluginListState } from '@/store/atoms';
import rendererIpc from '@/utils/rendererIpc';
import PluginPackage from '@/utils/plugin-package';

const electron = window.require('electron');

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      // maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
  }),
);
export default function Page(props) {
  const classes = useStyles();
  // const [checked, setChecked] = React.useState(['wifi']);
  const [pluginList, setPluginList] = useRecoilState<PluginPackage[]>(pluginListState);

  // const handleToggle = (plugin: PluginPackage, checked) => {
  //   const value = plugin.config.pkg.name;
  //   // eslint-disable-next-line no-param-reassign
  //   // const pluginBack = { ...plugin };
  //   // eslint-disable-next-line no-param-reassign
  //   plugin.config.pkg = { ...plugin.config.pkg };
  //   // eslint-disable-next-line no-param-reassign
  //   plugin.config.pkg.enable = checked;
  //   rendererIpc.sendToMain('updatePlugin', pluginBack);

  //   console.log('🚀 ~ file: index.tsx ~ line 40 ~ handleToggle ~ plugin', pluginBack, checked);
  //   // if (checked) {
  //   //   window.require(plugin.scriptPath);
  //   //   // newChecked.push(value);
  //   //   // doing
  //   // }

  //   // setChecked(newChecked);
  // };

  const installHandle = () => {
    rendererIpc.sendToMain('installPlugin');
  };

  return (
    <List
      subheader={<Button onClick={installHandle}>Install plugin</Button>}
      className={classes.root}
    >
      {pluginList.map((plugin) => {
        return (
          <ListItem key={plugin.config.pkg.name}>
            <ListItemIcon>
              <Wifi />
            </ListItemIcon>
            <ListItemText id="switch-list-label-wifi" primary={plugin.config.pkg.name} />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={(e, checked) => plugin.toggleEnable(checked)}
                checked={plugin.config.pkg.enable}
                inputProps={{ 'aria-labelledby': 'switch-list-label-wifi' }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
}
