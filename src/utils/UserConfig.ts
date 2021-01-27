class UserConfig {
  #config = {};

  private subscriptions = [];

  constructor(config) {
    this.#config = config;
  }

  subscribe(callback) {
    this.subscriptions.push(callback);
  }

  get(key) {
    return this.#config[key];
  }
  // has
  // inspect

  update(key, val) {
    this.#config[key] = val;
    this.subscriptions.forEach((callback) => callback());
  }
}

export default UserConfig;
