import lodash from 'lodash';
import jsonlint from 'jsonlint-mod';
import { defaultUserSetting } from '../../public/defaultConfig';

class UserConfig {
  #config = {};

  private subscriptions = [];

  constructor(private settingStr) {
    this.updateSource(settingStr);
  }

  updateSource(settingStr) {
    // TODO:readonly
    this.settingStr = settingStr;
    try {
      this.#config = jsonlint.parse(settingStr);
    } catch (error) {
      this.#config = { ...defaultUserSetting };
    }
    this.subscriptions.forEach((callback) => callback());
  }

  update(options) {
    this.#config = lodash.defaultsDeep(options, this.#config);
    this.subscriptions.forEach((callback) => callback());
  }

  subscribe(callback) {
    this.subscriptions.push(callback);
  }

  get(key) {
    // TODO:readonly
    return this.#config[key];
  }
  // has

  inspect() {
    // TODO:readonly
    return this.#config;
  }
}

export default UserConfig;
