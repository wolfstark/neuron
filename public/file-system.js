const fs = require('fs-extra');
const path = require('path');
const { app, dialog } = require('electron');
const PageConfig = require('./PageConfig');
const filenamify = require('filenamify');
const EventEmitter = require('events');

class FileSystem {
  static instance = null;
  /**
   * @type {{filename:string,title:string}[]}
   */
  list = [];
  pluginList = [];
  event = new EventEmitter();

  constructor(storepath) {
    this.storepath = storepath;
    this.docpath = path.resolve(storepath, 'pages');
    this.pluginpath = path.resolve(storepath, 'plugins');
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

  async loadPluginList() {
    try {
      await fs.ensureDir(this.pluginpath);
      const files = await fs.readdir(this.pluginpath);
      const plugins = [];

      const pms = files.map(async (file) => {
        const filepath = path.resolve(this.pluginpath, file);
        const stats = await fs.stat(filepath);
        if (stats.isDirectory() && this.qualifiedPlugin(filepath)) {
          plugins.push({ pkg: require(`${filepath}/package.json`), pathname: file });
          // if()
        }
      });
      // TODO
      await Promise.all(pms);
      this.pluginList = plugins;

      return this.pluginList;
    } catch (error) {
      console.error(error);
    }
  }

  getfilePath(title) {
    return path.resolve(this.docpath, `${filenamify(title)}.json`);
  }

  getPluginPath(pathname) {
    return path.resolve(this.pluginpath, filenamify(path.basename(pathname)));
  }
  /**
   *
   * @param {string} title
   */
  async newPage(title, content = '', meta = {}) {
    try {
      const config = new PageConfig().title(title).meta(meta).addBlock(content).toConfig();
      await this.createFile(this.getfilePath(title), JSON.stringify(config));
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

  async loadFileJson(title) {
    try {
      const str = await fs.readFile(this.getfilePath(title), 'utf-8');
      const json = JSON.parse(str);
      return json;
    } catch (error) {
      console.error(error);
    }
  }
  async modifyFileJson(title, json) {
    try {
      await fs.writeFile(this.getfilePath(title), JSON.stringify(json), 'utf-8');
    } catch (error) {
      console.error(error);
    }
  }

  async qualifiedPlugin(dirpath) {
    console.log(
      '🚀 ~ file: file-system.js ~ line 145 ~ FileSystem ~ qualifiedPlugin ~ dirpath',
      dirpath,
    );
    try {
      require.resolve(`${dirpath}/package.json`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async installPlugin(dirpath) {
    try {
      if (this.qualifiedPlugin(dirpath)) {
        await fs.copy(dirpath, this.getPluginPath(dirpath));
        const list = await this.loadPluginList(); // TODO: file & plugin 增量添加，不要重新获取完整列表
        this.event.emit('afterInstallPlugin', list);
      } else {
        // return Promise.reject();
        throw new Error('插件不正确');
      }
    } catch (error) {
      dialog.showErrorBox('Failed to load extension', 'Manifest file is missing or unreadable');
    }
  }
}

module.exports = FileSystem;
