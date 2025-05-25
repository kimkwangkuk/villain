import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Metadata } from 'next';
import PostDetailClient from './PostDetailClient';

export async function generateMetadata({ params }: { params: { postId: string } }): Promise<Metadata> {
  const postId = params.postId;
  let title = '게시글 상세';
  let description = '빌런의 게시글 상세 페이지입니다.';
  let image = '/default-og.png'; // 기본 OG 이미지 경로
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    const post = postSnap.data();
    title = post.title || title;
    description = post.content ? post.content.slice(0, 80) : description;
    if (post.ogImage) {
      image = post.ogImage;
    }
  }
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: 'article',
      url: `https://villain.today/postdetail/${postId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function Page() {
  return <PostDetailClient />;
} 