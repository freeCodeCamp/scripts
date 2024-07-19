export function isValidSectionTagName(tagName, type) {
  const validTags = {
    1: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], // MARKUP_SECTION_TYPE
    2: ['img'], // IMAGE_SECTION_TYPE
    3: ['ul', 'ol'] // LIST_SECTION_TYPE
  };
  return validTags[type] && validTags[type].includes(tagName);
}
