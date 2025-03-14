// 형용사와 명사 목록을 정의하여 내보내는 파일입니다.

const adjectives = [
  '멋진',
  '귀여운',
  '똑똑한',
  '용감한',
  '상냥한',
  '활발한',
  '열정적인',
  '우아한'
];

const nouns = [
  '호랑이',
  '사자',
  '독수리',
  '거북이',
  '늑대',
  '코끼리',
  '원숭이',
  '고양이'
];

/**
 * 랜덤으로 사용자 닉네임을 생성합니다.
 * 형용사 + 명사 + 숫자 조합 (예: "멋진고양이123")
 * 주의: 이 함수는 완벽한 중복 방지를 보장하지 않습니다.
 */
export function generateRandomUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  // 1부터 999 사이의 숫자 (겹치지 않도록 하기 위해 사용)
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjective}${noun}${number}`;
}

export { adjectives, nouns }; 