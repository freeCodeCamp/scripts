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
      try {
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
      } catch (error) {
        console.error(`Error rendering section: ${error.message}`);
      }
    });

    return result.join('\n\n');
  }

  renderMarkupSection([tagName, markers]) {
    try {
      let content = markers.map((marker) => this.renderMarker(marker)).join('');
      return this.wrapWithTag(tagName, content);
    } catch (error) {
      console.error(`Error rendering markup section: ${error.message}`);
      return '';
    }
  }

  renderImageSection([url]) {
    try {
      return `![Image](${url})`;
    } catch (error) {
      console.error(`Error rendering image section: ${error.message}`);
      return '';
    }
  }

  renderListSection([tagName, items]) {
    try {
      return items
        .map(
          (item) =>
            `- ${item[1].map((marker) => this.renderMarker(marker)).join('')}`
        )
        .join('\n');
    } catch (error) {
      console.error(`Error rendering list section: ${error.message}`);
      return '';
    }
  }

  renderCardSection([name, payload]) {
    try {
      switch (name) {
        case 'image':
          return this.renderImageCard(payload);
        case 'embed':
          return this.renderEmbedCard(payload);
        case 'html':
          return this.renderHtmlCard(payload);
        default:
          return `<!-- Card: ${name} -->`;
      }
    } catch (error) {
      console.error(`Error rendering card section: ${error.message}`);
      return '';
    }
  }

  renderImageCard(payload) {
    try {
      const { src, caption } = payload;
      let imageMarkdown = `![Image](${src})`;
      if (caption) {
        imageMarkdown += `\n*${caption}*`;
      }
      return imageMarkdown;
    } catch (error) {
      console.error(`Error rendering image card: ${error.message}`);
      return '';
    }
  }

  renderEmbedCard(payload) {
    try {
      const { url, html, type } = payload;
      if (type === 'video' || type === 'rich') {
        return html;
      }
      return `[Embedded content](${url})`;
    } catch (error) {
      console.error(`Error rendering embed card: ${error.message}`);
      return '';
    }
  }

  renderHtmlCard(payload) {
    try {
      const { html } = payload;
      return html;
    } catch (error) {
      console.error(`Error rendering HTML card: ${error.message}`);
      return '';
    }
  }

  renderMarker([type, openTypes, closeCount, text]) {
    try {
      // Implement marker rendering (e.g., bold, italic)
      return text;
    } catch (error) {
      console.error(`Error rendering marker: ${error.message}`);
      return text;
    }
  }

  wrapWithTag(tagName, content) {
    try {
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
    } catch (error) {
      console.error(`Error wrapping with tag: ${error.message}`);
      return content;
    }
  }
}
