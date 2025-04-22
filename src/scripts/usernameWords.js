// 형용사와 명사 목록을 정의하여 내보내는 파일입니다.

const adjectives = [
  '귀찮은',
  '뒤통수치는',
  '꼰대같은',
  '참견하는',
  '무시하는',
  '훈수두는',
  '책임전가하는',
  '불평많은',
  '시간뺏는',
  '약속어기는',
  '잠수타는',
  '갑질하는'
];

const nouns = [
  '빌런',
  '인간',
  '사람',
  '유형',
  '캐릭터',
  '인물',
  '존재',
  '문제아',
  '방해꾼',
  '재앙',
  '골칫거리',
  '귀신'
];

/**
 * 랜덤으로 사용자 닉네임을 생성합니다.
 * 형용사 + 명사 조합 (예: "참견하는빌런")
 * 중복을 고려하지 않습니다.
 */
export function generateRandomUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}`;
}

export { adjectives, nouns }; 