/**
 * 문자열에서 URL 패턴을 찾아 추출합니다.
 * @param text 검사할 텍스트
 * @returns 발견된 URL 배열
 */
export function detectUrls(text: string): string[] {
  if (!text) return [];

  // URL 패턴 정규식
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // 텍스트에서 URL 추출
  const urls = text.match(urlRegex);
  
  return urls || [];
}

/**
 * URL을 도메인 이름으로 변환합니다.
 * @param url URL 주소
 * @returns 도메인 이름
 */
export function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./i, '');
  } catch (error) {
    return url;
  }
}

/**
 * URL이 이미지인지 확인합니다.
 * @param url 확인할 URL
 * @returns 이미지 URL 여부
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerUrl.endsWith(ext));
}

/**
 * 텍스트에서 URL을 발견하고 해당 URL에 <a> 태그를 씌웁니다.
 * @param text 처리할 텍스트
 * @returns URL에 링크가 추가된 텍스트
 */
export function linkifyText(text: string): string {
  if (!text) return '';
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${getDomainFromUrl(url)}</a>`;
  });
} 