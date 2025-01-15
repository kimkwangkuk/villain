import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, getCategories } from '../api/firebase';
import { useAuth } from '../context/AuthContext';

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
  const [error, setError] = useState('');

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
        setError('카테고리를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isLoggedIn, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!formData.category) {
      setError('카테고리를 선택해주세요.');
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
      setError(error.message || '게시글 작성에 실패했습니다.');
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
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-center">카테고리 로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              빌런 카테고리
            </label>
            <select
              id="category"
              name="category"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">카테고리 선택</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows="6"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.content}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              게시글 작성
            </button>
          </div>
        </form>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              작성을 취소하시겠습니까?
            </h3>
            <p className="text-gray-500 mb-4">
              작성 중인 내용은 저장되지 않습니다.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                아니오
              </button>
              <button
                onClick={handleConfirmCancel}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none"
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