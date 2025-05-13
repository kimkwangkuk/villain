import { Metadata, ResolvingMetadata } from 'next';
import { getPost, getCategories } from '@/api/firebase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = {
  params: { postId: string }
};

// 동적 메타데이터 생성
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const postId = params.postId;
    
    // 게시물 데이터 가져오기
    const post = await getPost(postId);
    
    if (!post) {
      return {
        title: '게시글을 찾을 수 없습니다 - 빌런',
        description: '요청하신 게시글을 찾을 수 없습니다.',
      };
    }

    // 카테고리 이름 가져오기
    const categories = await getCategories();
    const category = categories.find(cat => cat.id === post.categoryId);
    const categoryName = category ? category.name : '';

    // 메타데이터 반환
    return {
      title: `${post.title} - 빌런`,
      description: post.content.substring(0, 160) + (post.content.length > 160 ? '...' : ''),
      openGraph: {
        title: post.title,
        description: post.content.substring(0, 160) + (post.content.length > 160 ? '...' : ''),
        type: 'article',
        authors: [post.authorName || '익명'],
        publishedTime: post.createdAt ? new Date(post.createdAt.seconds * 1000).toISOString() : undefined,
        section: categoryName,
        tags: [categoryName].filter(Boolean),
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.content.substring(0, 160) + (post.content.length > 160 ? '...' : ''),
      }
    };
  } catch (error) {
    console.error('메타데이터 생성 오류:', error);
    return {
      title: '빌런 - 직장 내 문제 상황 공유 플랫폼',
      description: '직장 내 문제 상황을 공유하고 해결책을 모색하는 커뮤니티입니다.',
    };
  }
}

// 클라이언트 컴포넌트
export default async function PostDetailPage({ params }: Props) {
  try {
    const postId = params.postId;
    const post = await getPost(postId);
    
    if (!post) {
      notFound();
    }
    
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-[800px] mx-auto px-4 py-8">
          <div className="mb-4">
            <Link href="/" className="text-blue-500 hover:underline">
              ← 목록으로 돌아가기
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex justify-between items-center mb-8 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">{post.authorName || '익명'}</span>
              <span className="mx-2">•</span>
              <span>
                {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '날짜 없음'}
              </span>
            </div>
            <div>
              {post.categoryName || '카테고리 없음'}
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none mb-8">
            {post.content}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between">
            <div className="flex items-center gap-2">
              <span>❤️</span>
              <span className="text-sm">{post.likes || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💬</span>
              <span className="text-sm">{post.commentCount || 0}</span>
            </div>
          </div>
          
          {/* 댓글 영역은 클라이언트 컴포넌트로 구현 예정 */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">댓글</h2>
            <p className="text-center text-gray-500 dark:text-gray-400">
              댓글 기능은 현재 구현중입니다.
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('게시글 로딩 실패:', error);
    notFound();
  }
} 