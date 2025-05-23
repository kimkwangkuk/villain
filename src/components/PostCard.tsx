import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCategories } from '@/api/categories';
import { updateLikes, deletePost } from '@/api/post';
import { updateReaction, getPostReactions } from '@/api/reaction';
import { reportContent } from '@/api/report';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';  // 한국어 로케일
import relativeTime from 'dayjs/plugin/relativeTime';
import { MessageIcon, LikeIcon, ShareIcon } from './Icons';  // 상단에 import 추가
import { detectUrls } from '@/utils/urlUtils';
import { reactions } from '@/data/reactions';

// shadcn/ui 컴포넌트 import
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onShare?: (e: React.MouseEvent, postId: string) => void;
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
    setReactionCount(post.reactionCount || 0);

    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.uid));
    }
  }, [categories, post.categoryId, post.likedBy, post.id, user, post.commentCount, post.reactionCount]);

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
      onShare(e, post.id);
    }
  };

  return (
    <Link 
      href={`/postdetail/${post.id}`}
      className="block transition-colors duration-200"
    >
      <Card className="h-full hover:bg-muted/5 py-3">
        <CardContent className="flex flex-col h-[360px] px-4">
          {/* 프로필 영역 - 타이틀 상단에 표시 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={post.authorPhotoURL || getDefaultProfileImage()}
                  alt={`${post.authorName}의 프로필`}
                />
                <AvatarFallback>
                  {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <div className="text-[13px] font-semibold">
                  {post.authorName}
                </div>
                <div className="text-[12px] text-muted-foreground">
                  <span>{categoryName}</span>
                  <span className="mx-1">·</span>
                  <span>{post.createdAt?.toDate && getRelativeTime(post.createdAt?.toDate())}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                    <span className="text-muted-foreground">⋮</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleReport}>
                    신고하기
                  </DropdownMenuItem>
                  {user && post.authorId === user.uid && (
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      삭제하기
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* 타이틀 */}
          <h2 className="text-[17px] font-bold mb-2 line-clamp-2">
            {post.title}
          </h2>
          
          {/* 본문 내용 */}
          <div className="flex-grow overflow-hidden">
            <p className="text-[15px] text-muted-foreground line-clamp-7 whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>
          
          {/* 좋아요/댓글 수 표시 영역 추가 */}
          <div className="mt-auto pt-2 flex items-center justify-between text-[14px] text-muted-foreground pb-2">
            <div className="flex items-center">
              {/* 반응 이모지 표시 */}
              {reactionEmojis.length > 0 && (
                <div className="flex -space-x-1 mr-2">
                  {reactionEmojis.map((emoji, index) => (
                    <div 
                      key={index} 
                      className="w-5 h-5 flex items-center justify-center bg-background rounded-full text-sm border border-border shadow-sm"
                      style={{ zIndex: 3 - index, marginLeft: index > 0 ? '-8px' : '0' }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              )}
              <span className="text-xs">{reactionCount || 0}명의 반응</span>
            </div>
            <span className="text-xs">댓글 {commentCount || 0}</span>
          </div>
          
          {/* 하단 정보 영역 */}
          <div className="mt-1">
            <div className="flex items-center justify-between pt-2 -mx-4 px-4">
              {/* 반응 버튼 */}
              <div className="relative flex-1 max-w-[33%]">
                <Button
                  onClick={handleReactionClick}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  {userReaction ? (
                    <span className="text-base">{userReaction.emoji}</span>
                  ) : (
                    <LikeIcon className="h-4 w-4" />
                  )}
                  <span className={`text-sm ${userReaction ? 'text-[#FF2600]' : ''}`}>
                    {userReaction ? userReaction.label : "반응"}
                  </span>
                </Button>
                
                {/* 반응 팝업 */}
                {showReactionPopup && (
                  <div 
                    ref={popupRef}
                    className="absolute bottom-full left-0 mb-2 bg-popover rounded-md shadow-md p-2 z-50 flex space-x-2 border border-border"
                  >
                    {reactions.map((reaction) => (
                      <button
                        key={reaction.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReactionSelect(reaction);
                        }}
                        className={`text-xl p-2 hover:bg-accent rounded-full transition-transform ${
                          userReaction?.id === reaction.id ? 'scale-125 bg-accent/50' : ''
                        }`}
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 댓글 버튼 */}
              <div className="flex-1 max-w-[33%] flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <MessageIcon className="h-4 w-4" />
                  <span className="text-sm">댓글</span>
                </Button>
              </div>
              
              {/* 공유 버튼 */}
              <div className="flex-1 max-w-[33%] flex justify-end">
                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ShareIcon className="h-4 w-4" />
                  <span className="text-sm">공유</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default PostCard; 