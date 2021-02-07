import lodash from 'lodash';
import jsonlint from 'jsonlint-mod';
// import { defaultUserSetting } from '../../public/defaultConfig';

export interface ConfigSchema {
  title: string;
  properties: Properties;
}

export interface Properties {
  [key: string]: TypescriptTsdk;
}

export interface TypescriptTsdk {
  type: string;
  default: boolean | null;
  name: string;
  description: string;
}

class UserConfig {
  #config = {};

  private subscriptions = [];

  constructor(private settingStr, private configSchemaList: ConfigSchema[]) {
    this.updateSource(settingStr, configSchemaList);
  }

  private static getSchemaListToDefaultProps(configSchemaList: ConfigSchema[]) {
    return configSchemaList.reduce((pre, current) => {
      const keys = Object.keys(current.properties);
      const props = { ...pre };
      keys.forEach((key) => {
        props[key] = current.properties[key].default;
      });
      return props;
    }, {});
  }

  updateSource(settingStr, configSchemaList) {
    // TODO:readonly
    this.settingStr = settingStr;
    const defaultUserSetting = UserConfig.getSchemaListToDefaultProps(configSchemaList);
    try {
      this.#config = { ...defaultUserSetting, ...jsonlint.parse(settingStr) };
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
