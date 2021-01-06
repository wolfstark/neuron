const express = require('express');
const cors = require('cors');
const { createWindow } = require('./window');
// const ogs = require('open-graph-scraper');
const FileSystem = require('./file-system');
const { sendToRenderer } = require('./mainIpc');

const nfs = FileSystem.getInstance();

const port = 3777; // TODO: 提供备用端口
const app = express();
// TODO: 创建app延后执行

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/addHtml', (req, res) => {
  console.log('🚀 ~ file: server.js ~ line 19 ~ app.post ~ req.params', req.body);
  // win.webContents.send('extension-html', req.body.selectHtml);
  // sendToRenderer('extension-html', req.body.selectHtml)
  const file = nfs.findFile(req.body.meta.title);
  if (file) {
    nfs.appendPage(req.body.meta.title, req.body.selectHtml);
  } else {
    nfs.newPage(req.body.meta.title, req.body.selectHtml, req.body.meta);
  }

  res.json({ code: 0 });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
