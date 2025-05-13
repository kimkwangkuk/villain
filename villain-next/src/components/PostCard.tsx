import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCategories, updateLikes, updateReaction, getPostReactions, deletePost, reportContent } from '@/api/firebase-post';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';  // 한국어 로케일
import relativeTime from 'dayjs/plugin/relativeTime';
import { MessageIcon, LikeIcon, ShareIcon } from './Icons';  // 상단에 import 추가
import { detectUrls } from '@/utils/urlUtils';
import { reactions } from '@/data/reactions';

// dayjs 설정
dayjs.locale('ko');
dayjs.extend(relativeTime);

interface Category {
  id: string;
  name: string;
}

interface Reaction {
  id: string;
  emoji: string;
  label: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  categoryId: string;
  createdAt: any;
  updatedAt?: any;
  likes: number;
  likedBy?: string[];
  commentCount: number;
  reactionCount?: number;
}

interface PostCardProps {
  post: Post;
  categories: Category[];
  onShare?: (postId: string) => void;
}

function PostCard({ post, categories, onShare }: PostCardProps) {
  const [categoryName, setCategoryName] = useState('');
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { isLoggedIn, user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const navigate = useRouter();
  
  // 반응 팝업 관련 상태
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [reactionCount, setReactionCount] = useState(post.reactionCount || 0);
  const [userReaction, setUserReaction] = useState<Reaction | null>(null);

  // 더보기 메뉴 관련 상태 추가
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const moreOptionsRef = useRef<HTMLDivElement>(null);

  // 반응 이모지 표시를 위한 상태 추가
  const [reactionEmojis, setReactionEmojis] = useState<string[]>([]);

  // 팝업 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 반응 버튼 클릭 시 이벤트 처리 방지
      if ((event.target as HTMLElement).closest('button')) {
        return;
      }
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowReactionPopup(false);
      }
    };

    if (showReactionPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReactionPopup]);

  // ESC 키로 팝업 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowReactionPopup(false);
      }
    };

    if (showReactionPopup) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showReactionPopup]);

  // 더보기 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target as Node)) {
        setShowMoreOptions(false);
      }
    };

    if (showMoreOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreOptions]);

  // ESC 키로 더보기 메뉴 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMoreOptions(false);
      }
    };

    if (showMoreOptions) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showMoreOptions]);

  useEffect(() => {
    // prop으로 전달된 categories 배열에서 해당 post의 카테고리를 찾습니다.
    if (categories && categories.length > 0) {
      const category = categories.find(cat => cat.id === post.categoryId);
      if (category) {
        setCategoryName(category.name);
      }
    }

    // posts 문서에 저장된 commentCount 값을 사용
    setCommentCount(post.commentCount || 0);

    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.uid));
    }
  }, [categories, post.categoryId, post.likedBy, post.id, user, post.commentCount]);

  // 반응 데이터 로드
  useEffect(() => {
    const loadReactions = async () => {
      try {
        const reactions = await getPostReactions(post.id);
        if (user && reactions[user.uid]) {
          setUserReaction(reactions[user.uid]);
        }
        
        // 반응 이모지 처리
        const emojiCounts: Record<string, number> = {};
        Object.values(reactions).forEach(reaction => {
          if (reaction && reaction.emoji) {
            if (!emojiCounts[reaction.emoji]) {
              emojiCounts[reaction.emoji] = 0;
            }
            emojiCounts[reaction.emoji]++;
          }
        });
        
        // 이모지를 개수 기준으로 정렬하고 최대 3개만 선택
        const sortedEmojis = Object.keys(emojiCounts)
          .sort((a, b) => emojiCounts[b] - emojiCounts[a])
          .slice(0, 3);
          
        setReactionEmojis(sortedEmojis);
      } catch (error) {
        console.error('반응 데이터 로드 실패:', error);
      }
    };

    loadReactions();
  }, [post.id, user]);

  const handleReactionClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 팝업이 열린 상태에서 버튼을 누르면 팝업 닫기
    if (showReactionPopup) {
      setShowReactionPopup(false);
      return;
    }

    // 이미 반응한 상태에서 버튼을 누르면 반응 취소
    if (userReaction) {
      try {
        // 낙관적 업데이트
        setUserReaction(null);

        // Firebase 업데이트
        const result = await updateReaction(post.id, user.uid, null);
        setReactionCount(result.reactionCount);
      } catch (error) {
        console.error('반응 취소 실패:', error);
        alert('반응 취소에 실패했습니다.');
      }
      return;
    }

    // 반응하지 않은 상태에서는 팝업 표시
    setShowReactionPopup(true);
  };

  const handleReactionSelect = async (reaction: Reaction) => {
    try {
      // 이미 선택한 반응을 다시 선택한 경우 취소
      if (userReaction?.id === reaction.id) {
        // 낙관적 업데이트
        setUserReaction(null);
        setShowReactionPopup(false);

        // Firebase 업데이트
        const result = await updateReaction(post.id, user!.uid, null);
        setReactionCount(result.reactionCount);
        return;
      }

      // 새로운 반응 선택
      // 낙관적 업데이트
      const previousReaction = userReaction;
      setUserReaction(reaction);
      setShowReactionPopup(false);

      // Firebase 업데이트
      const result = await updateReaction(post.id, user!.uid, reaction);
      setReactionCount(result.reactionCount);

      // 실패 시 롤백
      if (!result) {
        setUserReaction(previousReaction);
        throw new Error('반응 업데이트 실패');
      }
    } catch (error) {
      console.error('반응 처리 실패:', error);
      alert('반응 처리에 실패했습니다.');
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 낙관적 업데이트: 이전 상태 저장
    const previousIsLiked = isLiked;
    const previousLikes = likes;
    // 즉시 UI에 반영 (좋아요 추가/감소)
    setIsLiked(!previousIsLiked);
    setLikes(previousIsLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      const updatedPost = await updateLikes(post.id, user.uid, user.displayName || '익명');
      // 서버 응답에 따라 상태 보정
      if (updatedPost.likes !== undefined) {
        setLikes(updatedPost.likes);
      }
    } catch (error) {
      // 실패 시 롤백
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const getRelativeTime = (date: Date) => {
    return dayjs(date).fromNow();
  };

  const getDefaultProfileImage = () => {
    return 'https://via.placeholder.com/40x40';  // 또는 다른 기본 이미지
  };

  // 게시물 신고 처리
  const handleReport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMoreOptions(false);
    
    // 로그인 확인
    if (!isLoggedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 신고 사유 입력 (간단한 프롬프트 사용)
    const reason = prompt('신고 사유를 입력해주세요:');
    if (!reason) return; // 취소하거나 빈 값 입력 시 중단
    
    try {
      // 신고 처리 함수 호출
      await reportContent('post', post.id, user.uid, reason);
      
      // 성공 메시지
      alert('신고가 접수되었습니다.');
    } catch (error) {
      console.error('신고 처리 실패:', error);
      alert('신고 처리에 실패했습니다.');
    }
  };

  // 게시물 삭제 처리
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMoreOptions(false);
    
    // 삭제 확인
    if (window.confirm('이 게시물을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.')) {
      try {
        // 로딩 상태 추가 (선택사항)
        // setIsDeleting(true);
        
        // 게시물 삭제 함수 호출
        await deletePost(post.id);
        
        // 성공 메시지
        alert('게시물이 삭제되었습니다.');
        
        // 페이지 새로고침 또는 리디렉션 (선택사항)
        window.location.reload();
      } catch (error) {
        console.error('게시물 삭제 실패:', error);
        alert('게시물 삭제에 실패했습니다.');
      } finally {
        // 로딩 상태 해제 (선택사항)
        // setIsDeleting(false);
      }
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(post.id);
    }
  };

  return (
    <Link 
      href={`/postdetail/${post.id}`}
      className="block rounded-lg transition-colors duration-200"
    >
      <div className="flex flex-col h-full">
        {/* 컨텐츠 영역 내에 프로필 영역 포함 */}
        <div className="bg-[#F5F5F7] dark:bg-[#121212] rounded-2xl pt-[14px] p-5 pb-2 flex flex-col h-[360px] hover:bg-[#EBEBED] dark:hover:bg-[#1A1A1A] transition-colors duration-200">
          {/* 프로필 영역 - 타이틀 상단에 표시 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={post.authorPhotoURL || getDefaultProfileImage()}
                  alt={`${post.authorName}의 프로필`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 이니셜 표시
                    const target = e.target as HTMLImageElement;
                    if (target.parentNode) {
                      (target.parentNode as HTMLElement).innerHTML = `<div class="w-full h-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center">
                        <span class="text-xs text-gray-600 dark:text-gray-400">
                          ${post.authorName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>`;
                    }
                  }}
                />
              </div>
              <div className="ml-2">
                <div className="text-[13px] font-semibold text-gray-900 dark:text-neutral-300">
                  {post.authorName}
                </div>
                <div className="text-[12px] text-gray-500 dark:text-neutral-500">
                  <span>{categoryName}</span>
                  <span className="mx-1">·</span>
                  <span>{post.createdAt?.toDate && getRelativeTime(post.createdAt?.toDate())}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMoreOptions(!showMoreOptions);
                }} 
                className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-neutral-800"
              >
                <span className="text-gray-300 dark:text-neutral-500 text-sm transition-colors hover:text-gray-900 dark:hover:text-neutral-300">⋮</span>
              </button>
              
              {/* 더보기 메뉴 */}
              {showMoreOptions && (
                <div 
                  ref={moreOptionsRef}
                  className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-900 rounded-lg shadow-lg z-50 w-32 py-1 animate-fadeIn"
                >
                  {/* 신고 버튼 - 모든 사용자에게 표시 */}
                  <button
                    onClick={handleReport}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    신고하기
                  </button>
                  
                  {/* 삭제 버튼 - 작성자에게만 표시 */}
                  {user && post.authorId === user.uid && (
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      삭제하기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 타이틀 */}
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {post.title}
          </h2>
          
          {/* 본문 내용 */}
          <div className="flex-grow overflow-hidden">
            <p className="text-[15px] text-gray-700 dark:text-neutral-300 line-clamp-7 whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>
          
          {/* 하단 정보 영역 */}
          <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-200 dark:border-neutral-800">
            {/* 좋아요, 댓글 수 표시 */}
            <div className="flex items-center space-x-4">
              {/* 좋아요 버튼 */}
              <button 
                onClick={handleLike}
                className="flex items-center space-x-1 text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"
              >
                <LikeIcon className={`w-[18px] h-[18px] ${isLiked ? 'text-blue-500 fill-blue-500 dark:text-blue-400 dark:fill-blue-400' : 'text-gray-500 dark:text-neutral-500'}`} />
                <span className="text-xs">{likes > 0 ? likes : ''}</span>
              </button>
              
              {/* 댓글 버튼 */}
              <div className="flex items-center space-x-1 text-gray-500 dark:text-neutral-500">
                <MessageIcon className="w-[18px] h-[18px]" />
                <span className="text-xs">{commentCount > 0 ? commentCount : ''}</span>
              </div>
            </div>
            
            {/* 공유 버튼 */}
            <button 
              onClick={handleShare}
              className="text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"
            >
              <ShareIcon className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 