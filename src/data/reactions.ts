// 반응 타입 정의
export interface Reaction {
  id: string;
  emoji: string;
  label: string;
  description?: string;
}

// 게시물 반응 데이터
export const reactions: Reaction[] = [
  {
    id: 'like',
    emoji: '👍',
    label: '좋아요'
  },
  {
    id: 'love',
    emoji: '❤️',
    label: '사랑해요'
  },
  {
    id: 'laugh',
    emoji: '😂',
    label: '웃겨요'
  },
  {
    id: 'wow',
    emoji: '😮',
    label: '놀랐어요'
  },
  {
    id: 'sad',
    emoji: '😢',
    label: '슬퍼요'
  },
  {
    id: 'angry',
    emoji: '😠',
    label: '화나요'
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