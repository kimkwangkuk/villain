'use client';

import { useRouter } from 'next/navigation';

/**
 * react-router-dom의 useNavigate 훅을 Next.js에서 사용할 수 있도록 래핑한 훅
 * 기존 코드의 호환성을 유지하기 위해 사용합니다.
 * 
 * @returns {Function} navigate 함수
 */
export function useNavigate() {
  const router = useRouter();
  
  // react-router-dom의 navigate와 유사한 인터페이스 제공
  const navigate = (to, options = {}) => {
    if (options.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
  
  return navigate;
}

/**
 * react-router-dom의 Link 컴포넌트를 Next.js의 Link로 대체하기 위한 안내
 * 
 * 사용 예시:
 * import { Link } from 'react-router-dom'
 * <Link to="/path">텍스트</Link>
 * 
 * 다음으로 변경:
 * import Link from 'next/link'
 * <Link href="/path">텍스트</Link>
 */ 