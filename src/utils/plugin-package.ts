import Api from './api';
import rendererIpc from './rendererIpc';
import UserConfig from './UserConfig';

class PluginPackage {
  private clearPlugin;

  constructor(public config, private api: Api, private userConfig: UserConfig) {
    if (config.pkg.enable) {
      this.boost();
    }
  }

  getApi() {
    return this.api;
  }

  boost() {
    const module = window.require(this.config.scriptPath);
    // @ts-ignore
    this.clearPlugin = module(this.api, this.userConfig);
  }

  destory() {
    this.api.destory();
    if (this.clearPlugin) this.clearPlugin();
  }

  isSame(config) {
    return config.id === this.config.id;
  }

  toggleEnable(isEnable: boolean) {
    rendererIpc.sendToMain('updatePlugin', {
      ...this.config,
      pkg: {
        ...this.config.pkg,
        enable: isEnable,
      },
    });
    if (isEnable) {
      // this.boost();
    } else {
      this.destory();
    }
  }
}
export default PluginPackage;
