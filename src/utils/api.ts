import shrotid from 'short-uuid';

class Api {
  private ids = [];

  constructor(private setSlatePluginList) {}

  registerEditor(fn) {
    const plugin = fn({}); // TODO: props
    console.log("🚀 ~ file: api.ts ~ line 10 ~ Api ~ registerEditor ~ plugin", plugin)
    plugin.id = shrotid.generate();
    this.ids.push(plugin.id);
    this.setSlatePluginList((oldList) => [...oldList, plugin]);
  }

  // registerMenu() {}
  destory() {
    this.setSlatePluginList((oldList) => {
      const index = this.ids.indexOf(oldList.id);
      const list = [...oldList];
      if (index > -1) list.splice(index, 1);
      return list;
    });
  }
}
export default Api;
