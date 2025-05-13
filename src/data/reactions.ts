// 반응 타입 정의
export interface Reaction {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

// 게시물 반응 데이터
export const reactions: Reaction[] = [
  {
    id: 'like',
    emoji: '❤️',
    label: '좋아요',
    description: '이 게시물이 마음에 들어요'
  },
  {
    id: 'helpful',
    emoji: '👍',
    label: '도움됨',
    description: '이 내용이 도움이 되었어요'
  },
  {
    id: 'sad',
    emoji: '😢',
    label: '슬퍼요',
    description: '이 상황이 안타까워요'
  },
  {
    id: 'angry',
    emoji: '😡',
    label: '화나요',
    description: '이런 상황에 분노를 느껴요'
  },
  {
    id: 'funny',
    emoji: '😂',
    label: '웃겨요',
    description: '이 내용이 재미있어요'
  },
  {
    id: 'surprised',
    emoji: '😮',
    label: '놀라워요',
    description: '이 내용은 정말 놀라워요'
  }
];

// 반응 ID로 반응 정보 가져오기
export function getReactionById(id: string): Reaction | undefined {
  return reactions.find(reaction => reaction.id === id);
}

// 반응 이모지로 반응 정보 가져오기
export function getReactionByEmoji(emoji: string): Reaction | undefined {
  return reactions.find(reaction => reaction.emoji === emoji);
}

// 모든 반응 데이터 가져오기
export function getAllReactions(): Reaction[] {
  return reactions;
} 