// @flow
export const findHTMLTags = (wrapper: Object): Object =>
  wrapper.findWhere(el => typeof el.type() === "string");

export const findHTMLTag = (wrapper: Object): Object =>
  findHTMLTags(wrapper).first();

export const getHTMLTag = (wrapper: Object): string | null => {
  const tag = findHTMLTag(wrapper);
  return tag.length ? tag.type() : null;
};
