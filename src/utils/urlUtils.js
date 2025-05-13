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

/**
 * 텍스트에서 URL을 감지하여 분리하는 함수
 * @param {string} text 입력 텍스트
 * @returns {Array} URL과 일반 텍스트를 구분한 배열
 */
export function detectUrls(text) {
  if (!text) return [{ type: 'text', content: '', key: 'empty' }];

  // URL 정규식 패턴 (http, https로 시작하는 URL 검출)
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  
  // 텍스트를 URL과 일반 텍스트로 분리
  const parts = [];
  let lastIndex = 0;
  let match;
  let count = 0;
  
  while ((match = urlPattern.exec(text)) !== null) {
    // URL 앞의 일반 텍스트 추가
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
        key: `text-${count++}`
      });
    }
    
    // URL 추가
    parts.push({
      type: 'url',
      content: match[0],
      key: `url-${count++}`
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // 마지막 URL 이후의 일반 텍스트 추가
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
      key: `text-${count++}`
    });
  }
  
  return parts.length ? parts : [{ type: 'text', content: text, key: 'text-0' }];
}

/**
 * URL이 유효한지 확인하는 함수
 * @param {string} url 확인할 URL
 * @returns {boolean} 유효한 URL 여부
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
} 