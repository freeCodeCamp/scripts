import {
  MARKUP_SECTION_TYPE,
  IMAGE_SECTION_TYPE,
  LIST_SECTION_TYPE,
  CARD_SECTION_TYPE,
} from "../utils/section-types.js";
import logger from "../utils/logger.js";

export default class Renderer_0_3 {
  constructor(mobiledoc, options) {
    this.mobiledoc = mobiledoc;
    this.options = options;
    this.atoms = this.mobiledoc.atoms || [];
    this.cards = this.mobiledoc.cards || [];
    this.markups = this.mobiledoc.markups || [];
    this.markupStack = [];
    this.currentLink = null;
  }

  _findAtomByIndex(index) {
    let atom = this.atoms[index];
    if (!atom) {
      throw new Error(`No atom definition found at index ${index}`);
    }

    let [atomName, atomText, payload] = atom;

    return {
      atomName,
      atomText,
      payload,
    };
  }

  _findCardByIndex(index) {
    let card = this.cards[index];
    if (!card) {
      throw new Error(`No card definition found at index ${index}`);
    }

    let [cardType, payload] = card;

    return {
      cardType,
      payload,
    };
  }

  _findMarkupByIndex(index) {
    let markup = this.markups[index];
    if (!markup) {
      throw new Error(`No markup definition found at index ${index}`);
    }

    let [markupType, payload] = markup;

    return {
      markupType,
      payload,
    };
  }

  render() {
    const { sections } = this.mobiledoc;
    const result = this.renderMobiledocSections(sections);

    return result.join("\n\n");
  }

  renderMobiledocSections(sections) {
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
        logger.error(`Error rendering section: ${error.message}`);
      }
    });

    return result;
  }

  renderMarkupSection([tagName, markers]) {
    try {
      let content = markers.map((marker) => this.renderMarker(marker)).join("");
      return this.wrapWithTag(tagName, content);
    } catch (error) {
      logger.error(`Error rendering markup section: ${error.message}`);
      return "";
    }
  }

  renderImageSection([url]) {
    try {
      return `![Image](${url})`;
    } catch (error) {
      logger.error(`Error rendering image section: ${error.message}`);
      return "";
    }
  }

  renderListSection([tagName, items]) {
    try {
      let listMarkdown = "";
      if (tagName === "ul") {
        listMarkdown = items
          .map(
            (item) =>
              `* ${item.map((marker) => this.renderMarker(marker)).join("")}`
          )
          .join("\n");
      } else if (tagName === "ol") {
        listMarkdown = items
          .map(
            (item, i) =>
              `${i + 1}. ${item
                .map((marker) => this.renderMarker(marker))
                .join("")}`
          )
          .join("\n");
      } else {
        logger.error(`Unknown list type: ${tagName}`);
      }
      return listMarkdown;
    } catch (error) {
      logger.error(`Error rendering list section: ${error.message}`);
      return "";
    }
  }

  renderCardSection([cardIndex]) {
    try {
      const { cardType, payload } = this._findCardByIndex(cardIndex);
      switch (cardType) {
        case "image":
          return this.renderImageCard(payload);
        case "bookmark":
        case "embed":
          return this.renderEmbedCard(payload);
        case "html":
          logger.warn("Raw HTML card");
          return this.renderHtmlCard(payload);
        case "code":
          return this.renderCodeCard(payload);
        case "markdown":
          logger.warn("Raw markdown card");
          return this.renderMarkdownCard(payload);
        case "hr":
          return "---";
        default:
          logger.warn(`Unknown card type: ${cardType}`);
          return `<!-- Card: ${cardType} -->`;
      }
    } catch (error) {
      logger.error(`Error rendering card section: ${error.message}`);
      return "";
    }
  }

  renderImageCard(payload) {
    try {
      const { src, caption, alt } = payload;
      let imageMarkdown = `![${alt ? alt : "Image"}](${src})`;
      if (caption) {
        // Replace all whitespace character entities, and since the caption will
        // be italicized remove <em> tags while preserving possible whitespace
        // within the tags to prevent unintentional bold text
        const markdownCaption = caption
          .replace(/\&nbsp\;/g, " ")
          .replace(/\<em\>(\s*)/g, "$1")
          .replace(/(\s*)\<\/em\>/g, "$1")
          .replace(
            /\<a href="(?<href>.*)"\s*\>(?<openingWhitespace>\s*)(?<anchorText>(?:.(?!\<\/a\>))*.)(?<closingWhitespace>\s*)\<\/a\>/g,
            "[$<openingWhitespace>$<anchorText>$<closingWhitespace>]($<href>)"
          )
          .replace(/\<strong\>(\s*)/g, "$1**")
          .replace(/(\s*)\<\/strong\>/g, "**$1")
          .replace(/\<code\>(\s*)/g, "$1`")
          .replace(/(\s*)\<\/code\>/g, "`$1");
        imageMarkdown += `\n_${markdownCaption.trim()}_`;
      }
      return imageMarkdown;
    } catch (error) {
      logger.error(`Error rendering image card: ${error.message}`);
      return "";
    }
  }

  renderEmbedCard(payload) {
    try {
      const { url, type } = payload;
      if (type === "video" || type === "rich" || type === "bookmark") {
        return `%[${url}]`;
      }
      return `[Embedded content](${url})`;
    } catch (error) {
      logger.error(`Error rendering embed card: ${error.message}`);
      return "";
    }
  }

  renderHtmlCard(payload) {
    try {
      const { html } = payload;
      return html;
    } catch (error) {
      logger.error(`Error rendering HTML card: ${error.message}`);
      return "";
    }
  }

  renderCodeCard(payload) {
    try {
      const { code, language = "" } = payload;
      return `\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
    } catch (error) {
      logger.error(`Error rendering code card: ${error.message}`);
      return "";
    }
  }

  renderMarkdownCard(payload) {
    try {
      const { markdown } = payload;
      return markdown;
    } catch (error) {
      logger.error(`Error rendering markdown card: ${error.message}`);
      return "";
    }
  }

  renderTextMarker([type, openTypes, closeCount, text]) {
    let newText = "";
    try {
      if (openTypes.length !== 0) {
        [...new Set(openTypes)].forEach((markupIndex) => {
          if (text === " ") return; // Ignore whitespace with formatting
          const { markupType, payload } = this._findMarkupByIndex(markupIndex);
          switch (markupType) {
            case "a":
              newText += `[`;
              this.currentLink =
                payload[payload.findIndex((item) => item === "href") + 1];
              this.markupStack.push("a");
              break;
            case "strong":
              newText += `**`;
              this.markupStack.push("strong");
              break;
            case "em":
              newText += `_`;
              this.markupStack.push("em");
              break;
            case "code":
              newText += `\``;
              this.markupStack.push("code");
              break;
            default:
              logger.warn(`Unknown markup type: ${markupType}`);
              break;
          }
        });
      }

      const openingWhitespace = text.match(/^\s+/g);
      if (newText && openingWhitespace) {
        // Move whitespace outside of formatting delimiters
        newText += openingWhitespace.join("");
        text = text.replace(/^\s+/g, "");
      }
      newText += text;

      if (closeCount !== 0) {
        const closingTags = this.markupStack.slice(-closeCount);
        closingTags.reverse().forEach((markupType) => {
          const closingWhitespace = newText.match(/\s+$/g);
          if (closingWhitespace) newText = newText.replace(/\s+$/g, "");
          switch (markupType) {
            case "a":
              if (this.currentLink === null) {
                logger.error(`Link is null for text: ${text}`);
              }
              newText += `](${this.currentLink})`;
              this.currentLink = null;
              break;
            case "strong":
              newText += "**";
              break;
            case "em":
              newText += "_";
              break;
            case "code":
              newText += "`";
              break;
            default:
              logger.warn(`Unknown markup type: ${markupType}`);
              break;
          }
          if (closingWhitespace) newText += closingWhitespace.join("");
        });
        // if (closeCount > 1) {
        //   logger.info(
        //     `Markup type: ${type} - closeCount: ${closeCount} - openTypes: ${openTypes} - text: ${newText}`
        //   );
        // }

        this.markupStack = this.markupStack.slice(0, -closeCount);
      }

      return newText;
    } catch (error) {
      logger.error(`Error rendering marker: ${error.message}`);
      return text;
    }
  }

  renderAtomMarker([type, openTypes, closeCount, atomIndex]) {
    try {
      const { atomName, atomText, payload } = this._findAtomByIndex(atomIndex);
      switch (atomName) {
        case "soft-return":
          return "  \n";
        default:
          logger.warn(`Unknown atom type: ${atomName}`);
          return "";
      }
    } catch (error) {
      logger.error(`Error rendering atom marker: ${error.message}`);
      return "";
    }
  }

  renderMarker([type, openTypes, closeCount, textOrAtomIndex]) {
    if (type === 0) {
      return this.renderTextMarker([
        type,
        openTypes,
        closeCount,
        textOrAtomIndex,
      ]);
    } else if (type === 1) {
      return this.renderAtomMarker([
        type,
        openTypes,
        closeCount,
        textOrAtomIndex,
      ]);
    } else {
      logger.warn(`Unknown marker type: ${type}`);
      return "";
    }
  }

  wrapWithTag(tagName, content) {
    try {
      switch (tagName) {
        case "h1":
          return `# ${content}`;
        case "h2":
          return `## ${content}`;
        case "h3":
          return `### ${content}`;
        case "h4":
          return `#### ${content}`;
        case "h5":
          return `##### ${content}`;
        case "h6":
          return `###### ${content}`;
        case "p":
          return content;
        case "blockquote":
          return content
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");
        default:
          logger.warn(`Unknown tag: ${tagName}`);
          return content;
      }
    } catch (error) {
      logger.error(`Error wrapping with tag: ${error.message}`);
      return content;
    }
  }
}
