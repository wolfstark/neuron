import lodash from 'lodash';
import { defaultKeyboard } from '../../public/defaultConfig';

class Keyboard {
  #config = {};

  private subscriptions = [];

  constructor(private settingStr) {
    this.updateSource(settingStr);
  }

  updateSource(settingStr) {
    // TODO:readonly
    this.settingStr = settingStr;
    try {
      this.#config = JSON.parse(settingStr);
    } catch (error) {
      this.#config = { ...defaultKeyboard };
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

export default Keyboard;
