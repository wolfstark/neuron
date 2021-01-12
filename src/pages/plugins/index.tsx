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
import { Bluetooth, Wifi } from '@material-ui/icons';
import { useRecoilState } from 'recoil';
import { pluginListState } from '@/store/atoms';
import rendererIpc from '@/utils/rendererIpc';

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
  const [checked, setChecked] = React.useState(['wifi']);
  const [pluginList, setPluginList] = useRecoilState(pluginListState);

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

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
          <ListItem key={plugin.pkg.name}>
            <ListItemIcon>
              <Wifi />
            </ListItemIcon>
            <ListItemText id="switch-list-label-wifi" primary={plugin.pkg.name} />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={handleToggle(plugin.pkg.name)}
                checked={checked.indexOf(plugin.pkg.name) !== -1}
                inputProps={{ 'aria-labelledby': 'switch-list-label-wifi' }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
}
