import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { NavLink } from 'umi';
import { LinkProps } from 'react-router-dom';
import { ListItemLinkProps } from '../../layouts/index';

export function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () => React.forwardRef<any, Omit<LinkProps, 'to'>>((itemProps, ref) => (
      <NavLink to={to} ref={ref} {...itemProps} />
    )),
    [to]
  );

  return (
    <ListItem button component={renderLink}>
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} />
    </ListItem>
  );
}
