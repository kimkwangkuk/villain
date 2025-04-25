import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPost, getCategories, updatePost } from '../api/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PrimaryButton, TextButton } from '../components/Button';
import { ConfirmModal } from '../components/Modal';
import { LogoIconSimple } from '../components/Icons';

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
      alert('카테고리를 선택해주세요.');
      return false;
    }

    if (!formData.title.trim()) {
      setErrors({ title: '제목을 입력해주세요.' });
      alert('제목을 입력해주세요.');
      return false;
    }

    if (!formData.content.trim()) {
      setErrors({ content: '내용을 입력해주세요.' });
      alert('내용을 입력해주세요.');
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
      alert('로그인이 필요합니다.');
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
      alert(error.message || (isEditing ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.'));
    }
  };

  const handleCancel = () => {
    setShowDialog(true);
  };

  const handleConfirmCancel = () => {
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
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#E6E6E6] dark:bg-black">
      <div className="max-w-[590px] w-full mx-4 bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-[0_90px_70px_rgba(0,0,0,0.05)] dark:shadow-[0_90px_70px_rgba(0,0,0,0.2)] relative overflow-hidden
        before:absolute before:inset-0 before:-z-10 before:blur-4xl before:bg-gradient-to-b before:from-white/25 dark:before:from-black/25 before:to-transparent before:rounded-2xl"
      >
        {/* 상단 회색 컨테이너 - 배경색 옅은 회색으로 변경 */}
        <div className="w-full p-[20px] border-b border-gray-100 dark:border-neutral-900 bg-gray-100 dark:bg-[#121212]">
          <div className="flex justify-between items-center mb-4">
            {/* 왼쪽 앱 아이콘 */}
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <LogoIconSimple className="h-5 text-black dark:text-white" />
            </div>
            
            {/* 오른쪽 취소/게시 버튼 - Button.js 컴포넌트 사용 */}
            <div className="flex space-x-2">
              <TextButton
                type="button"
                onClick={handleCancel}
              >
                취소
              </TextButton>
              <PrimaryButton 
                type="button"
                onClick={handleSubmit}
              >
                {isEditing ? '수정' : '게시'}
              </PrimaryButton>
            </div>
          </div>
          
          {/* 안내 문구 수정 */}
          <div className="text-left">
            <p className="text-[18px] font-semibold text-gray-900 dark:text-neutral-200 leading-[140%]">
              빌런을 제보하거나<br />
              빌런 관련 토론을 시작해보세요.
            </p>
          </div>
        </div>

        {/* 하단 흰색 컨테이너 */}
        <div className="w-full">
          {/* 제목 입력 영역 - 아래 라인 제거, 텍스트 사이즈 20px */}
          <div className="px-6 pt-[20px]">
            <textarea
              name="title"
              placeholder="제목을 입력해주세요."
              className="w-full border-none focus:outline-none focus:ring-0 text-black dark:text-white text-[20px] font-medium resize-none bg-transparent"
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

          {/* 본문 입력 영역 - 텍스트 사이즈 16px 미디움 */}
          <div className="px-6 pt-[4px] pb-[20px] ">
            <div className="space-y-4">
              <div>
                <textarea
                  name="content"
                  placeholder="빌런 경험을 모두에게 공유해주세요."
                  className="w-full h-[200px] md:h-[250px] resize-none border-none focus:outline-none focus:ring-0 text-[16px] text-black dark:text-white bg-transparent"
                  value={formData.content}
                  onChange={handleChange}
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
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-auto py-2 px-3 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-neutral-700 appearance-none pr-8 select-arrow-custom"
              >
                <option value="" className="bg-white dark:bg-neutral-800">선택해주세요</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-white dark:bg-neutral-800">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirmCancel}
        title="작성을 취소하시겠습니까?"
        message="작성 중인 내용이 저장되지 않고 사라집니다."
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