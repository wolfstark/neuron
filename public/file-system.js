const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');
const PageConfig = require('./PageConfig');
const filenamify = require('filenamify');
const EventEmitter = require('events');

class FileSystem {
  static instance = null;
  /**
   * @type {{filename:string,title:string}[]}
   */
  list = [];
  event = new EventEmitter();

  constructor(storepath) {
    this.docpath = storepath;
  }

  /**
   *
   * @param {string} storepath
   * @returns {FileSystem}
   */
  static getInstance(storepath = path.resolve(app.getPath('documents'), './neuron')) {
    if (FileSystem.instance == null) {
      FileSystem.instance = new FileSystem(storepath);
    }
    return FileSystem.instance;
  }

  async loadFileList() {
    try {
      await fs.ensureDir(this.docpath);
      const files = await fs.readdir(this.docpath);
      // TODO
      this.list = files
        .filter((filename) => filename.endsWith('.json'))
        .map((filename) => {
          // pa
          return {
            filename,
            title: filename.split('.json')[0],
          };
        });
      console.log(
        '🚀 ~ file: file-system.js ~ line 44 ~ FileSystem ~ loadFileList ~ this.list',
        this.list,
      );
      return this.list;
    } catch (error) {
      console.error(error);
    }
  }

  getfilePath(title) {
    return path.resolve(this.docpath, `${filenamify(title)}.json`);
  }
  /**
   *
   * @param {string} title
   */
  async newPage(title, content = '', meta = {}) {
    // getPageTemplate
    // const str = await fs.readFile(filename, 'utf-8');
    // const json = JSON.parse(str);
    // modify json
    try {
      const config = new PageConfig().title(title).meta(meta).addBlock(content).toConfig();
      await this.createFile(this.getfilePath(title), JSON.stringify(config));
      // await this.loadFileList();
      // await fs.appendFile(
      //   path.resolve(this.docpath, title.endsWith('.json') ? title : `${title}.json`),
      //   content,
      // );
    } catch (error) {
      console.error('newPage', error);
    }
  }

  async appendPage(title, content = '') {
    try {
      const str = await fs.readFile(this.getfilePath(title), 'utf-8');
      const json = JSON.parse(str);
      const config = new PageConfig(json).addBlock(content).toConfig();
      await fs.writeFile(this.getfilePath(title), JSON.stringify(config), 'utf-8');
    } catch (error) {
      console.error(error);
    }
  }

  async createFile(title, content) {
    try {
      await fs.writeFile(title, content, 'utf-8');
      const list = await this.loadFileList();
      this.event.emit('afterCreateFile', list);
    } catch (error) {
      console.error(error);
    }
  }

  findFile(filename) {
    return this.list.find((item) => {
      return item.title === filenamify(filename);
    });
  }

  // async newPageWithMeta(filename, meta = {}) {
  //   try {
  //     await this.newPage(filename, JSON.stringify(meta));
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
}

module.exports = FileSystem;
