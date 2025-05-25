'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CommentCard from '@/components/CommentCard';
import { db } from '@/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  onSnapshot, 
  orderBy, 
  query, 
  updateDoc, 
  where,
  addDoc,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { deletePost, updateLikes } from '@/api/post';
import { updateReaction, getPostReactions } from '@/api/reaction';
import { deleteComment } from '@/api/comment';
import { MessageIcon, LikeIcon, ShareIcon } from '@/components/Icons';
import { PrimaryButton } from '@/components/Button';
import { EllipsisIcon } from '@/components/Icons';
import PostDetailSkeleton from '@/components/PostDetailSkeleton';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';  // 한국어 로케일
import relativeTime from 'dayjs/plugin/relativeTime';
import { detectUrls } from '@/utils/urlUtils';
import { reactions } from '@/data/reactions';
import { getCategories } from '@/api/categories';
import { reportContent } from '@/api/report';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// URL 파트 타입 정의
interface UrlPart {
  type: 'url' | 'text';
  content: string;
  key: number;
  display?: string;
}

// 게시물 타입 정의
interface Post extends DocumentData {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  categoryId: string;
  categoryName?: string;
  createdAt: any;
  updatedAt?: any;
  likes: number;
  likedBy?: string[];
  commentCount: number;
  viewCount: number;
  reactionCount?: number;
}

// 반응 타입 정의
interface Reaction {
  id: string;
  emoji: string;
  label: string;
}

dayjs.locale('ko');
dayjs.extend(relativeTime);

export default function PostDetailClient() {
  // Next.js의 useParams()는 [postId]를 객체 형태로 반환합니다
  const params = useParams();
  console.log('useParams() 값:', params);
  // postId 값을 추출합니다
  const id = params?.postId || '';
  console.log('추출된 ID:', id);
  const router = useRouter();
  const pathname = usePathname();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [userReaction, setUserReaction] = useState<Reaction | null>(null);
  const [reactionEmojis, setReactionEmojis] = useState<string[]>([]);

  // 외부 클릭 감지를 위한 useEffect 추가
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as Element).closest('button')) return;
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) setShowMoreMenu(false);
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) setShowReactionPopup(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    setLoading(true);
    setPost(null);
    setComments([]);
    setError(null);
    const postId = params?.postId;
    if (!postId) {
      setLoading(false);
      setError('잘못된 게시물 ID입니다.');
      return;
    }
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId as string);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          const postData = { id: postDoc.id, ...postDoc.data() } as Post;
          setPost(postData);
          await updateDoc(postRef, { viewCount: (postData.viewCount || 0) + 1 });
          if (user && postData.likedBy) setIsLiked(postData.likedBy.includes(user.uid));
        } else {
          setError('포스트를 찾을 수 없습니다.');
        }
      } catch (error: any) {
        setError(error.message || '게시물을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeComments = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setComments(commentsData);
      },
      (error: any) => {
        setError(error.message || '댓글을 불러오는데 실패했습니다.');
      }
    );
    fetchPost();
    return () => unsubscribeComments();
  }, [params?.postId]);

  useEffect(() => {
    const postId = params?.postId;
    if (!postId) return;
    const loadReactions = async () => {
      try {
        const reactionsData = await getPostReactions(postId as string);
        if (user && reactionsData[user.uid]) setUserReaction(reactionsData[user.uid]);
        const emojiCounts: Record<string, number> = {};
        Object.values(reactionsData).forEach(reaction => {
          if (reaction && reaction.emoji) {
            if (!emojiCounts[reaction.emoji]) emojiCounts[reaction.emoji] = 0;
            emojiCounts[reaction.emoji]++;
          }
        });
        const sortedEmojis = Object.keys(emojiCounts)
          .sort((a, b) => emojiCounts[b] - emojiCounts[a])
          .slice(0, 3);
        setReactionEmojis(sortedEmojis);
      } catch (error) {}
    };
    loadReactions();
  }, [params?.postId, user]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const postId = params?.postId;
    if (!user?.uid || !postId) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!commentContent.trim()) return;
    const currentComment = commentContent;
    setCommentContent('');
    const textarea = (e.target as HTMLFormElement).querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = '24px';
    }
    const previousCommentCount = post?.commentCount || 0;
    setPost((prev: any) => ({ ...prev, commentCount: previousCommentCount + 1 }));
    try {
      await addDoc(collection(db, 'comments'), {
        postId: postId,
        content: currentComment,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhotoURL: user.photoURL,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      setPost((prev: any) => ({ ...prev, commentCount: previousCommentCount }));
      setCommentContent(currentComment);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn || !user || !post) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (isLikeLoading) return;
    const previousIsLiked = isLiked;
    const previousLikes = post.likes;
    setIsLiked(!previousIsLiked);
    setPost((prev: Post | null) => {
      if (!prev) return null;
      return { ...prev, likes: previousIsLiked ? previousLikes - 1 : previousLikes + 1 };
    });
    try {
      setIsLikeLoading(true);
      const updatedPost = await updateLikes(post.id, user.uid, user.displayName || '익명');
      setPost((prev: Post | null) => {
        if (!prev) return null;
        return { ...prev, likes: updatedPost.likes, likedBy: updatedPost.likedBy };
      });
    } catch (error) {
      setIsLiked(previousIsLiked);
      setPost((prev: Post | null) => {
        if (!prev) return null;
        return { ...prev, likes: previousLikes };
      });
      alert('좋아요 처리에 실패했습니다.');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {}
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    if (!newContent.trim()) return;
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        content: newContent,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const postId = params?.postId;
    if (!postId) return;
    try {
      await deleteComment(postId as string, commentId);
    } catch (error) {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleReport = () => {
    alert('신고가 접수되었습니다.');
    setShowMoreMenu(false);
  };

  const handleDeletePost = async () => {
    const postId = params?.postId;
    if (!postId) return;
    try {
      await deletePost(postId as string);
      router.push('/');
    } catch (error) {
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const getRelativeTime = (date: any) => {
    return dayjs(date).fromNow();
  };

  const handleReactionClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const postId = params?.postId;
    if (!isLoggedIn || !user || !postId) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (showReactionPopup) {
      setShowReactionPopup(false);
      return;
    }
    if (userReaction) {
      try {
        setUserReaction(null);
        const result = await updateReaction(postId as string, user.uid, null);
        setPost((prev: any) => ({ ...prev, reactionCount: result.reactionCount }));
      } catch (error) {
        alert('반응 취소에 실패했습니다.');
      }
      return;
    }
    setShowReactionPopup(true);
  };

  const handleReactionSelect = async (reaction: Reaction) => {
    const postId = params?.postId;
    if (!postId || !user) return;
    try {
      if (userReaction?.id === reaction.id) {
        setUserReaction(null);
        setShowReactionPopup(false);
        const result = await updateReaction(postId as string, user.uid, null);
        setPost((prev: Post | null) => {
          if (!prev) return null;
          return { ...prev, reactionCount: result.reactionCount };
        });
        return;
      }
      const previousReaction = userReaction;
      setUserReaction(reaction);
      setShowReactionPopup(false);
      const result = await updateReaction(postId as string, user.uid, reaction);
      setPost((prev: Post | null) => {
        if (!prev) return null;
        return { ...prev, reactionCount: result.reactionCount };
      });
      if (!result) {
        setUserReaction(previousReaction);
        throw new Error('반응 업데이트 실패');
      }
    } catch (error) {
      alert('반응 처리에 실패했습니다.');
    }
  };

  const handleCategoryClick = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/?category=${categoryId}`);
  };

  if (loading) {
    return <PostDetailSkeleton />;
  }
  if (error) {
    return <div className="text-center py-8 text-red-500 dark:text-red-400">{error}</div>;
  }
  if (!post) {
    return <div className="text-center py-8 text-gray-700 dark:text-neutral-300">포스트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="w-full px-4">
        <div className="max-w-[590px] mx-auto">
          <Card className="bg-card shadow-sm rounded-xl overflow-hidden p-5 pb-3">
            <CardHeader className="space-y-0 p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        post?.authorPhotoURL ||
                        `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${post?.authorId}&backgroundColor=e8f5e9`
                      }
                      alt={`${post?.authorName}의 프로필`}
                    />
                    <AvatarFallback className="bg-muted">{post?.authorName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <div className="text-[13px] font-semibold text-foreground">
                      {post?.authorName}
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      <button
                        onClick={(e) => handleCategoryClick(e, post?.categoryId)}
                        className="hover:underline hover:text-foreground transition-colors"
                      >
                        {post?.categoryName}
                      </button>
                      <span className="mx-1">·</span>
                      <span>{getRelativeTime(post?.createdAt?.toDate())}</span>
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
                    <DropdownMenuContent align="end" className="w-32">
                      {user?.uid === post?.authorId && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/add-post?isEditing=true&postId=${post?.id}&title=${encodeURIComponent(post?.title || '')}&content=${encodeURIComponent(post?.content || '')}&categoryId=${post?.categoryId || ''}`);
                            }}
                          >
                            수정하기
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?\n관련된 모든 댓글도 함께 삭제됩니다.')) {
                                handleDeletePost();
                              }
                            }}
                          >
                            삭제하기
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={handleReport}>
                        신고하기
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div>
                <h1 className="text-[20px] font-semibold text-foreground mb-2">{post?.title}</h1>
                <p className="text-[16px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {detectUrls(post?.content).map((part: UrlPart) =>
                    part.type === 'url' ? (
                      <a
                        key={part.key}
                        href={part.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground hover:underline break-all"
                      >
                        {part.content}
                      </a>
                    ) : (
                      <span key={part.key}>{part.content}</span>
                    )
                  )}
                </p>
              </div>
              {detectUrls(post?.content).some((part: UrlPart) => part.type === 'url') && (
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  {detectUrls(post?.content).map((part: UrlPart) => {
                    if (part.type === 'url') {
                      let displayUrl = part.content;
                      try {
                        const url = new URL(part.content);
                        displayUrl = url.hostname;
                      } catch (e) {
                        console.error("URL 파싱 실패:", e);
                      }
                      return (
                        <a
                          key={part.key}
                          href={part.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:underline w-full"
                        >
                          <span className="flex-shrink-0">🔗</span>
                          <span className="truncate flex-1">{displayUrl}</span>
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
              <div className="pt-12">
                <div className="flex items-center justify-between text-[14px] text-muted-foreground">
                  <div className="flex items-center">
                    {reactionEmojis.length > 0 ? (
                      <>
                        <div className="flex -space-x-1 mr-1">
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
                        <span>{post.reactionCount || 0}명의 반응</span>
                      </>
                    ) : (
                      <span>{post.reactionCount || 0}명의 반응</span>
                    )}
                  </div>
                  <span>댓글 {post.commentCount || 0}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-3">
              <div className="relative flex-1 max-w-[33%]">
                <Button
                  onClick={handleReactionClick}
                  variant="ghost"
                  size="sm"
                  className="ml-4 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
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
              <div className="flex-1 max-w-[33%] flex justify-center">
                <Button
                  onClick={() => {
                    if (!isLoggedIn) {
                      alert('로그인이 필요합니다.');
                      return;
                    }
                    const commentInput = document.querySelector('textarea');
                    if (commentInput) {
                      commentInput.focus();
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <MessageIcon className="h-4 w-4" />
                  <span className="text-sm">댓글</span>
                </Button>
              </div>
              <div className="flex-1 max-w-[33%] flex justify-end">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare();
                  }}
                  variant="ghost"
                  size="sm"
                  className="mr-4 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ShareIcon className="h-4 w-4" />
                  <span className="text-sm">공유</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div className="w-full px-4 mt-4">
        <div className="max-w-[590px] mx-auto">
          <Card className="bg-card shadow-sm mb-4 p-5">
            <CardContent className="p-0">
              <form onSubmit={handleCommentSubmit}>
                <div className="w-full">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      <Avatar className="h-[30px] w-[30px]">
                        {isLoggedIn ? (
                          <AvatarImage
                            src={user?.photoURL || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${user?.uid}&backgroundColor=e8f5e9`}
                            alt="프로필"
                          />
                        ) : (
                          <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 w-full">
                        {isLoggedIn ? (
                          <>
                            <textarea
                              value={commentContent}
                              onChange={(e) => setCommentContent(e.target.value)}
                              placeholder="댓글을 달아주세요."
                              rows={1}
                              className="flex-1 bg-transparent resize-none border-none focus:outline-none focus:ring-0 text-[15px] text-foreground placeholder-muted-foreground overflow-hidden"
                              style={{ minHeight: '24px', height: commentContent ? 'auto' : '24px' }}
                              onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                                const target = e.currentTarget;
                                target.style.height = '24px';
                                target.style.height = Math.max(24, target.scrollHeight) + 'px';
                              }}
                            />
                            <div className="flex-shrink-0">
                              <Button type="submit" size="sm">
                                {pathname.includes('edit') ? '수정' : '올리기'}
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Link href="/login" as={`/login?from=/posts/${id}`} className="flex-1">
                              <div className="text-[15px] text-muted-foreground">
                                댓글을 작성하려면 로그인이 필요합니다.
                              </div>
                            </Link>
                            <div className="flex-shrink-0">
                              <Link href="/login" as={`/login?from=/posts/${id}`}>
                                <Button size="sm">로그인</Button>
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          {comments.length > 0 && (
            <Card className="bg-card shadow-sm">
              {comments.map((comment, index) => (
                <div key={comment.id}>
                  <CommentCard
                    comment={{
                      ...comment,
                      authorPhotoURL: comment.authorPhotoURL,
                      userId: comment.authorId,
                    }}
                    postAuthorId={post.authorId}
                    onEdit={(newContent) => handleEditComment(comment.id, newContent)}
                    onDelete={() => handleDeleteComment(comment.id)}
                  />
                  {index !== comments.length - 1 && <div className="h-[1px] bg-border" />}
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
      {showToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-background text-foreground border border-border px-4 py-2 rounded-lg shadow-md">
          링크가 복사되었습니다!
        </div>
      )}
    </div>
  );
} 