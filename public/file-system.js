const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');

class FileSystem {
  static instance = null;
  constructor(storepath) {
    this.docpath = storepath;
  }
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
      console.log('🚀 ~ file: file-system.js ~ line 11 ~ FileSystem ~ loadFileList ~ files', files);
      return files
        .filter((filename) => filename.endsWith('.json'))
        .map((filename) => {
          // pa
          return {
            filename,
            title: filename.split('.json')[0],
          };
        });
    } catch (error) {
      console.error(error);
    }
  }
  /**
   *
   * @param {string} filename
   */
  async newPage(filename) {
    try {
      await fs.appendFile(
        path.resolve(this.docpath, filename.endsWith('.json') ? filename : `${filename}.json`),
        '',
      );
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = FileSystem;
