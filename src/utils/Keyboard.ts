import lodash from 'lodash';
// import { defaultKeyboard } from '../../public/defaultConfig';

class Keyboard {
  #config = [];

  private subscriptions = [];

  /**
   * 内部用接口，可以接管全局Hotkey事件，返回符合的command
   * TODO: 定义事件托管函数，commandList需要进一步封装，指令设计模式
   * @param settingStr
   * @param commandList
   * @param keybindingList
   */
  constructor(private settingStr, private commandList, private keybindingList) {
    this.updateSource(settingStr, commandList, keybindingList);
  }

  /**
   * TODO:加入when对用户过于复杂，即便是对开发者也不是很友好，干脆去掉，command，key 都是唯一的,以后可以考虑支持一个command对多个key
   * @param commandList
   * @param keybindingList
   */
  private static getSchemaListToDefaultProps(commandList, keybindingList) {
    return commandList.map((command) => {
      const defaultKeybinding =
        keybindingList.find((keybinding) => keybinding.command === command.name) || {};
      return {
        command: command.name,
        ...defaultKeybinding,
      };
    });
  }

  private static getNormalizeList(keyboardList) {
    return lodash.uniqBy(
      keyboardList
        .filter((keyboard) => {
          return keyboard.command && keyboard.key;
        })
        .reverse(),
      'command',
    );
  }

  updateSource(settingStr, commandList, keybindingList) {
    // TODO:readonly
    this.settingStr = settingStr;
    const defaultKeyboard = Keyboard.getSchemaListToDefaultProps(commandList, keybindingList);
    try {
      this.#config = Keyboard.getNormalizeList([...defaultKeyboard, ...JSON.parse(settingStr)]);
    } catch (error) {
      this.#config = Keyboard.getNormalizeList(defaultKeyboard);
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
