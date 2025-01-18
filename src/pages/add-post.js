import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, getCategories } from '../api/firebase';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/Button';

function AddPostPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    category: ''
  });

  useEffect(() => {
    const originalPadding = document.body.style.paddingTop;
    
    document.body.style.paddingTop = '0';
    const navbar = document.querySelector('nav');
    if (navbar) navbar.style.display = 'none';

    return () => {
      document.body.style.paddingTop = originalPadding || '0';
      if (navbar) navbar.style.display = 'block';
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate('/login');
      return;
    }

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
  }, [isLoggedIn, user, navigate]);

  useEffect(() => {
    // errors를 의존성 배열에 추가
  }, [errors]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors({});
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
      await createPost({
        title: formData.title,
        content: formData.content,
        categoryId: formData.category
      });
      navigate('/');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      setErrors({ ...errors, general: error.message || '게시글 작성에 실패했습니다.' });
    }
  };

  const handleCancel = () => {
    setShowDialog(true);
  };

  const handleConfirmCancel = () => {
    document.body.style.paddingTop = '0';
    const navbar = document.querySelector('nav');
    if (navbar) navbar.style.display = 'block';
    
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] py-8">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-center">카테고리 로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-[0_90px_70px_rgba(0,0,0,0.05)] relative 
        before:absolute before:inset-0 before:-z-10 before:blur-4xl before:bg-gradient-to-b before:from-white/25 before:to-transparent before:rounded-2xl"
      >
        <div className="border-b border-gray-100">
          <div className="px-6">
            <div className="flex justify-between items-center h-14">
              <h1 className="text-base font-medium">빌런 종류</h1>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="text-right border-none bg-transparent focus:outline-none focus:ring-0 text-gray-500 cursor-pointer appearance-none pr-8 text-base"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100">
          <div className="px-6">
            <div className="flex justify-between items-center h-14">
              <h1 className="text-base font-medium">빌런 네임</h1>
              <input
                type="text"
                name="title"
                placeholder="제목을 입력하세요"
                className="text-right border-none focus:outline-none focus:ring-0 text-gray-500 text-base"
                value={formData.title}
                onChange={handleChange}
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
                className="w-full h-[300px] resize-none border-none focus:outline-none focus:ring-0 text-base"
                value={formData.content}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-between items-center">
          <div className="text-red-500 text-sm">
            {errors.category || errors.title || errors.content || errors.general}
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              취소
            </button>
            <PrimaryButton type="button" onClick={handleSubmit}>
              올리기
            </PrimaryButton>
          </div>
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium mb-4">
              작성을 취소하시겠습니까?
            </h3>
            <p className="text-gray-500 mb-4">
              작성 중인 내용은 저장되지 않습니다.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-700 hover:text-gray-900"
              >
                아니오
              </button>
              <button
                onClick={handleConfirmCancel}
                className="bg-black text-white px-4 py-2 rounded-md"
              >
                네
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPostPage; 