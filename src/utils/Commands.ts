export default class Commands {
  constructor(private commandList, private editor) {}

  executeCommand(command, ...args) {
    const commandEntity = this.commandList.find((_command) => _command.name === command);
    if (commandEntity && commandEntity.callback) {
      commandEntity.callback(this.editor, ...args);
    }
  }

  getCommands(): string[] {
    return this.commandList;
  }

  updateCommand(commandList, editor) {
    this.commandList = commandList;
    this.editor = editor;
    // TODO:readonly
    // this.settingStr = settingStr;
    // const defaultUserSetting = UserConfig.getSchemaListToDefaultProps(configSchemaList);
    // try {
    //   this.#config = { ...defaultUserSetting, ...jsonlint.parse(settingStr) };
    // } catch (error) {
    //   this.#config = { ...defaultUserSetting };
    // }
    // this.subscriptions.forEach((callback) => callback());
  }
  // registerCommand(...args) {}
}
