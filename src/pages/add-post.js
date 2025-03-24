import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPost, getCategories, updatePost } from '../api/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PrimaryButton, LineButton } from '../components/Button';
import { detectUrls } from '../utils/urlUtils';
import Dialog from '../components/Dialog';

function AddPostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing;
  const editingPost = location.state?.post;
  
  const { isLoggedIn, user } = useAuth();
  const { isDarkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: editingPost?.title || '',
    content: editingPost?.content || '',
    category: editingPost?.categoryId || ''
  });
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    category: ''
  });

  useEffect(() => {
    const originalPadding = document.body.style.paddingTop;
    
    document.body.style.paddingTop = '64px'; // 네비게이션 바 높이만큼 패딩 추가
    const navbar = document.querySelector('nav');
    // 네비게이션 바는 표시하되 오른쪽 버튼들을 숨김
    if (navbar) {
      navbar.style.display = 'block'; // 네비게이션 바 표시 확인
      const navbarButtons = navbar.querySelector('div.flex.items-center.space-x-2');
      if (navbarButtons) {
        navbarButtons.style.display = 'none';
      }
    }

    return () => {
      document.body.style.paddingTop = originalPadding || '0';
      if (navbar) {
        // 컴포넌트 언마운트 시 네비게이션 바 원상복구
        const navbarButtons = navbar.querySelector('div.flex.items-center.space-x-2');
        if (navbarButtons) {
          navbarButtons.style.display = 'flex';
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate('/login');
      return;
    }

    const fetchCategories = async () => {
      console.log('카테고리 불러오기 시도');
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        console.log('카테고리 로드 완료:', categoriesData);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('카테고리 로딩 실패:', error);
        setErrors({ ...errors, general: '카테고리를 불러오는데 실패했습니다.' });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isLoggedIn, user, navigate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // 제목이나 내용이 변경되면 에러 메시지 초기화
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [formData.title, formData.content]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // 카테고리가 변경되면 에러 메시지 초기화
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const fieldName = e.target.name;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: e.target.value
    }));

    setErrors(prev => {
      if (prev[fieldName]) {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
      return prev;
    });
  };

  const validateForm = () => {
    if (!formData.category) {
      setErrors({ category: '카테고리를 선택해주세요.' });
      return false;
    }

    if (!formData.title.trim()) {
      setErrors({ title: '제목을 입력해주세요.' });
      return false;
    }

    if (!formData.content.trim()) {
      setErrors({ content: '내용을 입력해주세요.' });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ ...errors, general: '로그인이 필요합니다.' });
      navigate('/login');
      return;
    }

    try {
      if (isEditing) {
        await updatePost(editingPost.id, {
          title: formData.title,
          content: formData.content,
          categoryId: formData.category
        });
        navigate(`/posts/${editingPost.id}`);
      } else {
        await createPost({
          title: formData.title,
          content: formData.content,
          categoryId: formData.category
        });
        navigate('/');
      }
    } catch (error) {
      console.error(isEditing ? '게시글 수정 실패:' : '게시글 작성 실패:', error);
      setErrors({ ...errors, general: error.message || (isEditing ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.') });
    }
  };

  const handleCancel = () => {
    setShowDialog(true);
  };

  const handleConfirmCancel = () => {
    document.body.style.paddingTop = '0';
    const navbar = document.querySelector('nav');
    if (navbar) {
      // 네비게이션 바 원상복구
      navbar.style.display = 'block';
      const navbarButtons = navbar.querySelector('div.flex.items-center.space-x-2');
      if (navbarButtons) {
        navbarButtons.style.display = 'flex';
      }
    }
    
    if (isEditing) {
      navigate(`/posts/${editingPost.id}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#111111] py-8">
        <div className="max-w-[820px] mx-auto px-4">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-[0_90px_70px_rgba(0,0,0,0.05)] dark:shadow-[0_90px_70px_rgba(0,0,0,0.2)] relative">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-[340px] p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-neutral-900">
                <div className="flex flex-col items-start space-y-6">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse"></div>
                  <div className="space-y-4">
                    <div className="h-6 w-48 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                    <div className="h-6 w-40 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="border-b border-gray-100 dark:border-neutral-900">
                  <div className="px-6">
                    <div className="flex justify-between items-center h-[72px]">
                      <div className="h-5 w-24 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                      <div className="h-5 w-32 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div className="h-8 w-full bg-gray-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                    <div className="h-[200px] w-full bg-gray-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#111111] flex items-center justify-center py-4 md:py-8">
      <div className="max-w-[820px] w-full mx-4 bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-[0_90px_70px_rgba(0,0,0,0.05)] dark:shadow-[0_90px_70px_rgba(0,0,0,0.2)] relative overflow-hidden
        before:absolute before:inset-0 before:-z-10 before:blur-4xl before:bg-gradient-to-b before:from-white/25 dark:before:from-black/25 before:to-transparent before:rounded-2xl"
      >
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-[340px] p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-neutral-900 bg-gray-50 dark:bg-[#111111]">
            <div className="flex flex-col items-start space-y-6">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 dark:text-neutral-200">
                  내 일상을 어지럽히는 빌런을 제보하고
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-neutral-200">
                  밝은 세상을 만들어요.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="border-b border-gray-100 dark:border-neutral-900">
              <div className="px-6">
                <div className="flex justify-between items-center h-[72px]">
                  <h1 className="text-base font-medium text-gray-900 dark:text-neutral-200">빌런 종류</h1>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="text-right border-none bg-transparent focus:outline-none focus:ring-0 text-gray-500 dark:text-neutral-400 cursor-pointer appearance-none pr-8 text-base select-arrow-custom max-w-[200px] truncate"
                  >
                    <option value="" className="bg-white dark:bg-neutral-800">카테고리 선택</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-white dark:bg-neutral-800">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 dark:border-neutral-900">
              <div className="px-6">
                <div className="min-h-[72px] flex items-center py-3">
                  <textarea
                    name="title"
                    placeholder="제목을 입력하세요"
                    className="w-full border-none focus:outline-none focus:ring-0 text-gray-500 dark:text-neutral-300 text-base resize-none bg-transparent"
                    value={formData.title}
                    onChange={(e) => {
                      handleChange(e);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    rows="1"
                    style={{ 
                      minHeight: '24px',
                      height: 'auto'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <textarea
                    name="content"
                    placeholder="빌런 경험을 모두에게 공유해주세요."
                    className="w-full h-[200px] md:h-[250px] resize-none border-none focus:outline-none focus:ring-0 text-base text-gray-700 dark:text-neutral-300 bg-transparent"
                    value={formData.content}
                    onChange={handleChange}
                  />
                  {/* URL 미리보기 */}
                  {formData.content && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-neutral-500 space-y-1">
                      {detectUrls(formData.content).map((part) => (
                        part.type === 'url' && (
                          <a
                            key={part.key}
                            href={part.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 hover:underline w-full"
                          >
                            <span className="flex-shrink-0">🔗</span>
                            <span className="truncate flex-1">{part.content}</span>
                          </a>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div className="text-red-500 text-sm truncate">
                {errors.category || errors.title || errors.content || errors.general}
              </div>
              <div className="flex space-x-2 w-full sm:w-auto justify-end">
                <LineButton
                  type="button"
                  onClick={handleCancel}
                >
                  취소
                </LineButton>
                <PrimaryButton 
                  type="button"
                  onClick={handleSubmit}
                >
                  {isEditing ? '수정' : '올리기'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog 
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirmCancel}
        title="작성을 취소하시겠습니까?"
        description="작성 중인 내용은 저장되지 않습니다."
      />

      {/* 커스텀 화살표 아이콘을 위한 스타일 */}
      <style>
        {`
          .select-arrow-custom {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right center;
            background-size: 1.5em 1.5em;
          }
          
          @media (prefers-color-scheme: dark) {
            .select-arrow-custom {
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a3a3a3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            }
          }
          
          :root.dark .select-arrow-custom {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a3a3a3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          }
        `}
      </style>
    </div>
  );
}

export default AddPostPage; 