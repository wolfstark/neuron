const fs = require('fs-extra');
const path = require('path');
const { app, dialog } = require('electron');
const PageConfig = require('./PageConfig');
const filenamify = require('filenamify');
const EventEmitter = require('events');
const { defaultUserSetting, defaultKeyboard } = require('./defaultConfig');
const lodash = require('lodash');

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
    this.configpath = path.resolve(storepath, 'config');
    this.configFilePath = path.resolve(this.configpath, 'config.json');
    this.keyboardPath = path.resolve(this.configpath, 'keyboard.json');
  }
  async exists(filepath) {
    let res = true;
    try {
      await fs.access(filepath, fs.constants.F_OK);
    } catch (error) {
      res = false;
    }
    return res;
  }
  async loadKeyboardJson() {
    try {
      await fs.ensureDir(this.configpath);
      const isExists = await this.exists(this.keyboardPath);
      if (isExists) {
        const keyboardStr = await fs.readFile(this.keyboardPath, 'utf-8');
        // const userSetting = JSON.parse(settingStr);

        return keyboardStr;
      } else {
        const keyboardStr = JSON.stringify(defaultKeyboard);
        await fs.writeFile(this.keyboardPath, keyboardStr, 'utf-8');
        return keyboardStr;
      }
    } catch (error) {
      console.error(error);
    }
  }
  async loadConfigJson() {
    try {
      await fs.ensureDir(this.configpath);
      const isExists = await this.exists(this.configFilePath);
      if (isExists) {
        const settingStr = await fs.readFile(this.configFilePath, 'utf-8');
        // const userSetting = JSON.parse(settingStr);

        return settingStr;
      } else {
        const settingStr = JSON.stringify(defaultUserSetting);
        await fs.writeFile(this.configFilePath, settingStr, 'utf-8');
        return settingStr;
      }
    } catch (error) {
      console.error(error);
    }
  }
  async updateConfigJson(jsonstr) {
    try {
      await fs.writeFile(this.configFilePath, jsonstr, 'utf-8');
      this.event.emit('afterUpdateConfig', jsonstr);
    } catch (error) {
      console.error(error);
    }
  }
  async updateKeyboard(jsonstr) {
    try {
      await fs.writeFile(this.keyboardPath, jsonstr, 'utf-8');
      this.event.emit('afterUpdateKeyboard', jsonstr);
    } catch (error) {
      console.error(error);
    }
  }
  filenamify(name) {
    return filenamify(name, { replacement: '-' });
  }
  /**
   *
   * @param {string} storepath
   * @returns {FileSystem}
   */
  static getInstance(storepath = path.resolve(app.getPath('downloads'), './neuron')) {
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
          const pkgstr = await fs.readFile(`${filepath}/package.json`, 'utf-8');
          const pkg = JSON.parse(pkgstr);
          plugins.push({
            pkg,
            pathname: filepath,
            scriptPath: path.resolve(filepath, pkg.main),
            id: `${file}/${pkg.title}`,
          });
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

  getFilenameToPath(title) {
    return path.resolve(this.docpath, `${this.filenamify(title)}.json`);
  }

  getPluginPath(pathname) {
    return path.resolve(this.pluginpath, this.filenamify(path.basename(pathname)));
  }
  /**
   *
   * @param {string} title
   */
  async newPage(title, content = '', meta = {}) {
    try {
      const pathname = this.getFilenameToPath(title);
      const filename = this.filenamify(title);
      const config = new PageConfig()
        .title(title)
        .meta({ ...meta, filename })
        .addBlock(content)
        .toConfig();
      await this.createFile(pathname, JSON.stringify(config));
    } catch (error) {
      console.error('newPage', error);
    }
  }

  async appendPage(title, content = '') {
    // bugfix: 如果打开了当前页面，通过server添加的数据就只会在刷新的时候才能显示，应该通知render editor重新获取页面数据
    try {
      const str = await fs.readFile(this.getFilenameToPath(title), 'utf-8');
      const json = JSON.parse(str);
      const config = new PageConfig(json).addBlock(content).toConfig();
      await fs.writeFile(this.getFilenameToPath(title), JSON.stringify(config), 'utf-8');
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
      return item.title === this.filenamify(filename);
    });
  }

  async loadFileJson(title) {
    try {
      const str = await fs.readFile(this.getFilenameToPath(title), 'utf-8');
      const json = JSON.parse(str);
      return json;
    } catch (error) {
      console.error(error);
    }
  }
  async modifyFileJson(title, json) {
    try {
      await fs.writeFile(this.getFilenameToPath(title), JSON.stringify(json), 'utf-8');
    } catch (error) {
      console.error(error);
    }
  }

  async updatePlugin(plugin) {
    try {
      await fs.writeFile(
        path.resolve(plugin.pathname, 'package.json'),
        JSON.stringify(plugin.pkg),
        'utf-8',
      );
      const p = this.pluginList.find((item) => {
        return item.id === plugin.id;
      });
      p.pkg = plugin.pkg;
      // const list = await this.loadPluginList(); // TODO: file & plugin 增量添加，不要重新获取完整列表
      this.event.emit('afterInstallPlugin', this.pluginList);
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
