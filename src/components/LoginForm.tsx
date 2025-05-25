'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/firebase';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 리디렉션 경로 가져오기 (쿼리 파라미터에서)
  const redirectPath = searchParams.get('redirect') || '/home';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(formData.email.trim(), formData.password);
      console.log('로그인 성공');
      console.log('이동할 경로:', redirectPath);
      
      router.push(redirectPath);
    } catch (error: any) {
      console.error('로그인 실패:', error);
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError('');
      console.log('구글 로그인 시도 - 로그인 페이지');
      console.log('현재 URL:', window.location.href);
      
      // 팝업이 차단되지 않도록 사용자에게 안내
      console.log('잠시 후 로그인 팝업이 열립니다. 팝업 차단을 허용해 주세요.');
      
      // 개발 환경에서 설정 정보 확인
      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase 설정 확인 - 현재 환경:', process.env.NODE_ENV);
        console.log('Firebase 인증 상태 확인:', auth.currentUser);
      }
      
      // 에러 핸들링 개선을 위한 타임아웃 설정
      const loginTimeout = setTimeout(() => {
        console.error('구글 로그인 시간 초과 (10초)');
        setError('로그인 요청이 시간 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
        setIsGoogleLoading(false);
      }, 10000);
      
      // 구글 로그인 시도
      const user = await googleLogin();
      
      // 타임아웃 취소
      clearTimeout(loginTimeout);
      
      if (user) {
        console.log('구글 로그인 성공 - 로그인 페이지');
        console.log('로그인 사용자 정보:', {
          uid: user.uid,
          email: user.email,
          name: user.displayName
        });
        
        // 로그인 성공 후 잠시 로딩 상태 유지 (사용자에게 피드백 제공)
        setTimeout(() => {
          setIsGoogleLoading(false);
          router.push(redirectPath);
        }, 1000); // 1초 지연
      } else {
        setIsGoogleLoading(false);
        throw new Error('로그인은 성공했지만 사용자 정보를 받지 못했습니다.');
      }
    } catch (error: any) {
      setIsGoogleLoading(false);
      console.error('Google 로그인 실패 - 로그인 페이지:', error);
      
      // 상세 오류 정보 로깅
      if (error.code) console.error('오류 코드:', error.code);
      if (error.message) console.error('오류 메시지:', error.message);
      
      // 도메인 인증 오류 처리
      if (error.code === 'auth/unauthorized-domain') {
        setError('현재 도메인이 Firebase에 등록되지 않았습니다. Firebase 콘솔에서 도메인을 추가해주세요.');
        console.error('Firebase 콘솔에서 승인된 도메인 목록에 현재 도메인(localhost)을 추가해야 합니다.');
        console.error('https://console.firebase.google.com/project/_/authentication/settings 에서 승인된 도메인을 확인해주세요.');
        console.error('에뮬레이터를 사용 중인지 확인하세요. 에뮬레이터 사용 시 도메인 제한이 우회됩니다.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('로그인 팝업이 닫혔습니다. 팝업 창을 닫지 말고 로그인을 완료해 주세요.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('브라우저에서 팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해 주세요.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.');
        console.error('로컬호스트와 Firebase 서버 간의 연결에 문제가 있습니다.');
        console.error('CORS 또는 네트워크 문제일 수 있습니다.');
      } else if (error.code === 'auth/internal-error') {
        setError('Firebase 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        console.error('Firebase 내부 오류 - 에뮬레이터 설정을 확인하세요.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('이전 팝업 요청이 취소되었습니다. 다시 시도해 주세요.');
      } else {
        setError(`Google 로그인에 실패했습니다: ${error.code || '알 수 없는 오류'}`);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">환영합니다</h1>
                <p className="text-balance text-muted-foreground">
                  Villain 계정으로 로그인하세요
                </p>
              </div>
              
              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email" 
                  type="email"
                  placeholder="example@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  또는
                </span>
              </div>
              <Button 
                variant="outline" 
                className="flex w-full items-center justify-center gap-2 bg-background dark:bg-background"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {isGoogleLoading ? '로그인 중...' : 'Google로 로그인'}
              </Button>
              <div className="text-center text-sm">
                계정이 없으신가요?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  회원가입
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="로그인 이미지"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        계속 진행하면 <a href="#">서비스 이용약관</a>과{" "}
        <a href="#">개인정보 처리방침</a>에 동의하게 됩니다.
      </div>
    </div>
  )
} 