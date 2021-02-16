import BaseLink from '@/components/BaseLink/index';
import React from 'react';
import { fileListState } from '@/store/atoms';
import { makeStyles } from '@material-ui/core/styles';
import { useRecoilState } from 'recoil';
import {
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { useStore } from '@/store/reducer-provider';

const useStyles = makeStyles({
  table: {
    // minWidth: 650,
  },
});

export default function Page(props) {
  const { fileList } = useStore();
  // const [fileList, setFileList] = useRecoilState(fileListState);
  const classes = useStyles();
  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>标题</TableCell>
              <TableCell align="right">修改时间</TableCell>
              {/* <TableCell align="right">Fat&nbsp;(g)</TableCell>
              <TableCell align="right">Carbs&nbsp;(g)</TableCell>
              <TableCell align="right">Protein&nbsp;(g)</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {fileList.map((row) => (
              <TableRow key={row.title}>
                <TableCell component="th" scope="row">
                  <BaseLink to={`/page/${row.title}`}>{row.title}</BaseLink>
                </TableCell>
                <TableCell align="right">2021-01-06 16:22:50</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
