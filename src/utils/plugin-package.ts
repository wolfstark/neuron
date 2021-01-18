import Api from './api';
import rendererIpc from './rendererIpc';

class PluginPackage {
  private clearPlugin;

  constructor(public config, private api: Api) {
    if (config.pkg.enable) {
      // window.require('');
      this.boost();
    }
  }

  boost() {
    const module = window.require(this.config.scriptPath);
    // @ts-ignore
    this.clearPlugin = module(api);
  }

  destory() {
    this.api.destory();
    this.clearPlugin();
  }

  isSame(config) {
    return config.id === this.config.id;
  }

  toggleEnable(isEnable: boolean) {
    // const value = plugin.config.pkg.name;
    // eslint-disable-next-line no-param-reassign
    // const pluginBack = { ...plugin };
    this.config.pkg = { ...this.config.pkg };
    this.config.pkg.enable = isEnable;
    rendererIpc.sendToMain('updatePlugin', this.config);
    if (isEnable) {
      this.boost();
    } else {
      this.destory();
    }
  }
}
export default PluginPackage;
