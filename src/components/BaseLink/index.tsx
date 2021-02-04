import React from 'react';
import { Link as UmiLink } from 'umi';
import { Link } from '@material-ui/core';

export default function BaseLink({ to, children }) {
  return (
    <Link component={UmiLink} to={to}>
      {children}
    </Link>
  );
}
