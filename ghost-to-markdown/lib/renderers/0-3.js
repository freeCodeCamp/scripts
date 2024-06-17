import {
  MARKUP_SECTION_TYPE,
  IMAGE_SECTION_TYPE,
  LIST_SECTION_TYPE,
  CARD_SECTION_TYPE
} from '../utils/section-types.js';
import { isValidSectionTagName } from '../utils/tag-names.js';

export default class Renderer_0_3 {
  constructor(mobiledoc, options) {
    this.mobiledoc = mobiledoc;
    this.options = options;
  }

  render() {
    const { sections } = this.mobiledoc;
    let result = [];

    sections.forEach((section) => {
      const [type, ...rest] = section;
      switch (type) {
        case MARKUP_SECTION_TYPE:
          result.push(this.renderMarkupSection(rest));
          break;
        case IMAGE_SECTION_TYPE:
          result.push(this.renderImageSection(rest));
          break;
        case LIST_SECTION_TYPE:
          result.push(this.renderListSection(rest));
          break;
        case CARD_SECTION_TYPE:
          result.push(this.renderCardSection(rest));
          break;
        default:
          throw new Error(`Unexpected section type "${type}"`);
      }
    });

    return result.join('\n\n');
  }

  renderMarkupSection([tagName, markers]) {
    let content = markers.map((marker) => this.renderMarker(marker)).join('');
    return this.wrapWithTag(tagName, content);
  }

  renderImageSection([url]) {
    return `![Image](${url})`;
  }

  renderListSection([tagName, items]) {
    return items
      .map(
        (item) =>
          `- ${item[1].map((marker) => this.renderMarker(marker)).join('')}`
      )
      .join('\n');
  }

  renderCardSection([name, payload]) {
    // Implement card rendering if needed
    return `<!-- Card: ${name} -->`;
  }

  renderMarker([type, openTypes, closeCount, text]) {
    // Implement marker rendering (e.g., bold, italic)
    return text;
  }

  wrapWithTag(tagName, content) {
    switch (tagName) {
      case 'h1':
        return `# ${content}`;
      case 'h2':
        return `## ${content}`;
      case 'h3':
        return `### ${content}`;
      case 'h4':
        return `#### ${content}`;
      case 'h5':
        return `##### ${content}`;
      case 'h6':
        return `###### ${content}`;
      case 'p':
        return content;
      default:
        return content;
    }
  }
}
