export const formatUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;
    // 경로가 20자 이상이면 자르기
    const truncatedPath = path.length > 20 ? path.substring(0, 20) + '...' : path;
    return `${urlObj.hostname}${truncatedPath}`;
  } catch {
    return url;
  }
};

export const detectUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return {
        type: 'url',
        content: part,
        display: formatUrl(part),
        key: index
      };
    }
    return {
      type: 'text',
      content: part,
      key: index
    };
  });
}; 