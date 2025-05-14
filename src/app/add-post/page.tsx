'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogoIconSimple } from '../../components/Icons';
import { PrimaryButton, TextButton } from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import { getCategories } from '../../api/categories';
import { Category } from '../../api/categories';
import { createPost } from '../../api/post';
import { useAuth } from '../../context/AuthContext';

export default function AddPostPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 인증 상태 확인
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 카테고리 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('카테고리 로딩 실패:', error);
        setErrors({ ...errors, general: '카테고리를 불러오는데 실패했습니다.' });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }));
    
    // 카테고리 에러 메시지 초기화
    if (errors.category) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // 유효성 검사 실패 시 첫 번째 에러 메시지 알림
      if (errors.category) alert(errors.category);
      else if (errors.title) alert(errors.title);
      else if (errors.content) alert(errors.content);
      return;
    }

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    try {
      setSubmitting(true);
      const post = await createPost({
        title: formData.title,
        content: formData.content,
        categoryId: formData.category
      });
      
      console.log('게시글 생성 완료:', post);
      router.push('/');
    } catch (error: any) {
      console.error('게시글 작성 실패:', error);
      alert(error.message || '게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  // 선택된 카테고리 이름 찾기
  const getSelectedCategoryName = () => {
    if (!formData.category) return '선택해주세요';
    const selectedCategory = categories.find(c => c.id === formData.category);
    return selectedCategory ? selectedCategory.name : '선택해주세요';
  };

  // 인증 로딩 중이면 로딩 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E6E6E6] dark:bg-black">
        <p className="text-lg text-gray-700 dark:text-gray-300">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-4 pb-4 px-4 bg-[#E6E6E6] dark:bg-black md:justify-center md:py-10 md:px-6 lg:px-8">
      <div className="w-full md:max-w-[590px] mx-4 bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-[0_90px_70px_rgba(0,0,0,0.05)] dark:shadow-[0_90px_70px_rgba(0,0,0,0.2)] relative overflow-hidden
        before:absolute before:inset-0 before:-z-10 before:blur-4xl before:bg-gradient-to-b before:from-white/25 dark:before:from-black/25 before:to-transparent before:rounded-2xl"
      >
        {/* 상단 회색 컨테이너 */}
        <div className="w-full p-[20px] border-b border-gray-100 dark:border-neutral-900 bg-gray-100 dark:bg-[#121212]">
          <div className="flex justify-between items-center mb-4">
            {/* 왼쪽 앱 아이콘 */}
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <LogoIconSimple className="h-5 text-black dark:text-white" />
            </div>
            
            {/* 오른쪽 취소/게시 버튼 */}
            <div className="flex space-x-2">
              <TextButton
                type="button"
                onClick={handleCancel}
                disabled={submitting}
              >
                취소
              </TextButton>
              <PrimaryButton 
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '게시 중...' : '게시'}
              </PrimaryButton>
            </div>
          </div>
          
          {/* 안내 문구 */}
          <div className="text-left">
            <p className="text-[18px] font-semibold text-gray-900 dark:text-neutral-200 leading-[140%]">
              빌런을 제보하거나<br />
              빌런 관련 토론을 시작해보세요.
            </p>
          </div>
        </div>

        {/* 하단 흰색 컨테이너 */}
        <div className="w-full">
          {/* 제목 입력 영역 */}
          <div className="px-6 pt-[20px]">
            <textarea
              name="title"
              placeholder="제목을 입력해주세요."
              className="w-full border-none focus:outline-none focus:ring-0 text-black dark:text-white text-[18px] font-medium resize-none bg-transparent"
              value={formData.title}
              onChange={(e) => {
                handleChange(e);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              rows={1}
              style={{ 
                minHeight: '24px',
                height: 'auto'
              }}
              disabled={submitting}
            />
          </div>

          {/* 본문 입력 영역 */}
          <div className="px-6 pt-[4px] pb-[20px]">
            <div className="space-y-4">
              <div>
                <textarea
                  name="content"
                  placeholder="빌런 경험을 모두에게 공유해주세요."
                  className="w-full h-[200px] md:h-[250px] resize-none border-none focus:outline-none focus:ring-0 text-[16px] text-black dark:text-white bg-transparent"
                  value={formData.content}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* 카테고리 선택 영역 */}
          <div className="px-6 pb-[20px]">
            <div className="flex justify-between items-center">
              <div className="text-[16px] font-medium text-gray-700 dark:text-neutral-300">
                빌런 카테고리
                <p className="text-xs text-gray-400 dark:text-neutral-600">관련도가 높은 카테고리에 게시하세요.</p>
              </div>
              <div>
                {loading ? (
                  <div className="text-[15px] text-gray-700 dark:text-neutral-300 px-[11px] py-[7px] pr-9 rounded-[8px] border border-gray-200 dark:border-neutral-700 font-medium min-w-[120px] bg-white dark:bg-neutral-800 relative text-left">
                    로딩 중...
                  </div>
                ) : (
                  <Dropdown
                    selectedValue={formData.category}
                    onChange={handleCategorySelect}
                  >
                    <Dropdown.Button>
                      {getSelectedCategoryName()}
                    </Dropdown.Button>
                    <Dropdown.Menu>
                      {categories.map((category) => (
                        <Dropdown.Item 
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 