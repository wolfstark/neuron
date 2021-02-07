import shrotid from 'short-uuid';

class Api {
  #ids = [];

  constructor(private setSlatePluginList, private setCommandList, private setConfigSchemaList) {}

  // get version () {
  //   return require('../package.json').version
  // }

  // hasPlugin (id) {
  //   return this.service.plugins.some(p => matchesPluginId(id, p.id))
  // }

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

  registerConfigSchema(schema) {
    const schemaConfig = { ...schema }; // TODO: props 支持动态修改props
    schemaConfig.id = shrotid.generate();
    this.#ids.push(schemaConfig.id);
    this.setConfigSchemaList((oldList) => [...oldList, schemaConfig]);
  }

  // registerMenu() {}
  destory() {
    ['setSlatePluginList', 'setCommandList', 'registerConfigSchema'].forEach((method) => {
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
