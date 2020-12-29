const fs = require("fs-extra");
const path = require("path");

class FileSystem{
  constructor(path){
    this.docpath = path;
  }
  async loadFileList(){
    try {
      await fs.ensureDir(this.docpath)
      const files = await fs.readdir(this.docpath)
      console.log("🚀 ~ file: file-system.js ~ line 11 ~ FileSystem ~ loadFileList ~ files", files)
      return files.filter(filename=>filename.endsWith('.md')).map(filename=>{
        // pa
        return {
          filename,
          title:filename.split('.md')[0],
        }
      })
    } catch (error) {
      console.error(error)
    }
  }
  /**
   *
   * @param {string} filename
   */
  async newPage(filename){
    try {
      await fs.appendFile(path.resolve(this.docpath,filename.endsWith('.md')?filename:`${filename}.md`),'')
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = FileSystem
