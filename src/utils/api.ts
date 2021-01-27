import shrotid from 'short-uuid';

class Api {
  #ids = [];

  constructor(private setSlatePluginList, private setCommandList) {}

  registerEditor(editorConfig) {
    const plugin = { ...editorConfig }; // TODO: props 支持动态修改props
    plugin.id = shrotid.generate();
    this.#ids.push(plugin.id);
    this.setSlatePluginList((oldList) => [...oldList, plugin]);
  }

  registerCommand(commandPlugin) {
    // const plugin = callback({}); // TODO: props 支持动态修改props
    const plugin = { ...commandPlugin }; // TODO: props 支持动态修改props
    plugin.id = shrotid.generate();
    this.#ids.push(plugin.id);
    this.setCommandList((oldList) => [...oldList, plugin]);
  }

  // registerMenu() {}
  destory() {
    ['setSlatePluginList', 'setCommandList'].forEach((method) => {
      this[method]((oldList) => {
        const list = [...oldList];
        this.#ids.forEach((id) => {
          const curIndex = list.findIndex((item) => item.id === id);
          if (curIndex > -1) list.splice(curIndex, 1);
        });
        return list;
      });
    });
  }
}
export default Api;
