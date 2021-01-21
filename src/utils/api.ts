import shrotid from 'short-uuid';

class Api {
  #ids = [];

  constructor(private setSlatePluginList) {}

  registerEditor(fn) {
    const plugin = fn({}); // TODO: props
    plugin.id = shrotid.generate();
    this.#ids.push(plugin.id);
    this.setSlatePluginList((oldList) => [...oldList, plugin]);
  }

  // registerMenu() {}
  destory() {
    this.setSlatePluginList((oldList) => {
      // const index = this.#ids.indexOf(oldList.id);
      const list = [...oldList];
      this.#ids.forEach((id) => {
        const curIndex = list.findIndex((item) => item.id === id);
        if (curIndex > -1) list.splice(curIndex, 1);
      });
      return list;
    });
  }
}
export default Api;
