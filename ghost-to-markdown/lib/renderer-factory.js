import Renderer_0_2 from './renderers/0-2.js';
import Renderer_0_3 from './renderers/0-3.js';

export default class MarkdownRendererFactory {
  constructor(options = {}) {
    this.options = options;
  }

  render(mobiledoc) {
    const { version } = mobiledoc;
    switch (version) {
      case '0.2.0':
      case undefined:
      case null:
        return new Renderer_0_2(mobiledoc, this.options).render();
      case '0.3.0':
      case '0.3.1':
      case '0.3.2':
        return new Renderer_0_3(mobiledoc, this.options).render();
      default:
        throw new Error(`Unexpected Mobiledoc version "${version}"`);
    }
  }
}
