const shortid = require('short-uuid');

const getPageTemplate = (title) => ({
  meta: {
    // title: 'Open Graph protocol',
    // description:
    //   'The Open Graph protocol enables any web page to become a rich object in a social graph.',
    // image: 'http://ogp.me/logo.png',
    // url: 'http://ogp.me/',
  },
  block: [
    {
      children: [
        {
          children: [
            {
              text: title,
            },
          ],
          id: shortid.generate(),
          type: 'h1',
        },
      ],
    },
  ],
});

class PageConfig {
  config = { meta: {}, block: [{ children: [] }] };
  constructor(config = {}) {
    Object.assign(this.config, config);// ！浅合并，可能会出问题
  }
  title(title) {
    this.config.block[0].children[0] = {
      children: [
        {
          text: title,
        },
      ],
      id: shortid.generate(),
      type: 'h1',
    };
    return this;
  }
  meta(meta) {
    this.config.meta = { ...this.config.meta, ...meta };
    return this;
  }
  addBlock(text) {
    this.config.block[0].children.push({
      children: [
        {
          text,
        },
      ],
      id: shortid.generate(),
      type: 'p', //TODO 修改type
    });
    return this;
  }
  toConfig() {
    return this.config;
  }
}

module.exports = PageConfig;
