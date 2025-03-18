export const truncateText = (
  text: string,
  maxLength?: number,
  active = true
) => {
  if (!active || !text || !maxLength || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

export const limitArrayItems = (
  array: string[],
  maxItems?: number,
  showAll = false
) => {
  if (!array || !maxItems || array.length <= maxItems || showAll) {
    return array;
  }
  return array.slice(0, maxItems);
};
