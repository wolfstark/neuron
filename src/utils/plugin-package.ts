import lodash from 'lodash';
import Api from './api';
import rendererIpc from './rendererIpc';

class PluginPackage {
  private clearPlugin;

  constructor(public config, private api: Api) {
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
    this.clearPlugin = module(this.api);
    console.log('🚀 ~ file: plugin-package.ts ~ line 23 ~ PluginPackage ~ boost', this.config);
  }

  destory() {
    this.api.destory();
    if (this.clearPlugin) this.clearPlugin();
    console.log('🚀 ~ file: plugin-package.ts ~ line 29 ~ PluginPackage ~ destory', this.config);
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
