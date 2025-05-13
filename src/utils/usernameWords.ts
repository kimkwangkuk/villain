// 형용사 목록
const adjectives = [
  '행복한', '즐거운', '멋진', '훌륭한', '끝내주는', '대단한', '화려한', '활기찬', 
  '신비한', '창의적인', '똑똑한', '현명한', '용감한', '재미있는', '유쾌한', '친절한', 
  '정직한', '열정적인', '우아한', '사랑스러운', '매력적인', '소중한', '귀여운', '믿음직한',
  '자신감있는', '상냥한', '쾌활한', '다정한', '정의로운', '사려깊은', '기발한', '개성있는'
];

// 명사 목록
const nouns = [
  '호랑이', '여우', '사자', '코끼리', '고양이', '강아지', '원숭이', '판다', 
  '곰', '토끼', '다람쥐', '코알라', '캥거루', '펭귄', '기린', '독수리', 
  '늑대', '표범', '치타', '하마', '얼룩말', '악어', '거북이', '나비', 
  '곤충', '매미', '벌', '소', '말', '양', '돼지', '염소', '닭', '물고기',
  '의사', '선생님', '요리사', '가수', '무용가', '작가', '학생', '과학자', 
  '화가', '배우', '감독', '프로그래머', '디자이너', '선수', '기술자', '농부',
  '산', '바다', '강', '나무', '꽃', '별', '구름', '바람', '달', '태양',
  '기차', '자동차', '비행기', '배', '자전거', '롤러코스터', '케이크', '빵', '아이스크림'
];

/**
 * 랜덤한 한글 사용자 이름을 생성합니다.
 * 형식: [형용사][명사][숫자] 형식 (예: 행복한호랑이12)
 */
export function generateRandomUsername(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 100); // 0-99 사이의 숫자
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

/**
 * 특정 인덱스의 형용사와 명사를 조합하여 사용자 이름을 생성합니다.
 * 일관된 이름 생성이 필요할 때 사용합니다.
 */
export function getUsernameByIndex(adjectiveIndex: number, nounIndex: number, number: number): string {
  const adjective = adjectives[adjectiveIndex % adjectives.length];
  const noun = nouns[nounIndex % nouns.length];
  
  return `${adjective}${noun}${number}`;
} 