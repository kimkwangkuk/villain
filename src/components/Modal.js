import { useState, useEffect, useRef } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../api/firebase';

// 기본 모달 컴포넌트
function BaseModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-300">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// 이름 변경 모달
export function EditNameModal({ isOpen, onClose, onSubmit, initialValue = '', error }) {
  const [displayName, setDisplayName] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(displayName);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="이름 변경"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">
            새로운 이름
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-300"
            placeholder="새로운 이름을 입력하세요"
            maxLength={20}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            저장
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 로그아웃 확인 모달
export function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="로그아웃"
    >
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-neutral-400">정말 로그아웃 하시겠습니까?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// 게시글 삭제 확인 모달
export function DeletePostConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="게시글 삭제"
    >
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-neutral-400">정말 이 게시글을 삭제하시겠습니까?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// 자기소개 수정 모달
export function EditBioModal({ isOpen, onClose, onSubmit, initialValue = '', error }) {
  const [bio, setBio] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(bio);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="자기소개 수정"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">
            자기소개
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[120px] dark:bg-neutral-800 dark:text-neutral-300"
            placeholder="자신을 소개해주세요"
            maxLength={200}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
            {bio.length}/200자
          </p>
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            저장
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 프로필 이미지 선택 모달
export function ProfileImageModal({ isOpen, onClose, onSelect, currentImage }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileImages = async () => {
      const storage = getStorage();
      const imageUrls = [];
      
      try {
        // woman1.webp와 woman2.webp 가져오기
        for (let i = 1; i <= 2; i++) {
          const imageRef = ref(storage, `profile_images/woman${i}.webp`);
          const url = await getDownloadURL(imageRef);
          imageUrls.push(url);
        }
        setImages(imageUrls);
      } catch (error) {
        console.error('이미지 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadProfileImages();
    }
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="프로필 이미지 선택"
    >
      {loading ? (
        <div className="text-center py-4 text-gray-700 dark:text-neutral-300">로딩중...</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {images.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => onSelect(imageUrl)}
                className={`relative rounded-lg overflow-hidden aspect-square ${
                  currentImage === imageUrl ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`프로필 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}

// 대댓글 작성 모달
export const ReplyModal = ({ isOpen, onClose, onSubmit, comment }) => {
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const modalRef = useRef();
  const maxLength = 300;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (content.trim() === '') return;
    onSubmit(content);
    setContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="relative bg-white dark:bg-neutral-900 w-full max-w-lg p-5 rounded-lg shadow-lg"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-200 mb-3">
          답글 작성
        </h3>
        
        {comment && (
          <div className="flex space-x-3 mb-4 bg-gray-100 dark:bg-neutral-800 p-3 rounded-lg">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {comment.authorPhotoURL ? (
                <img
                  src={comment.authorPhotoURL}
                  alt={comment.authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-neutral-300">
                {comment.authorName || '익명'}
              </p>
              <p className="text-sm text-gray-700 dark:text-neutral-400 line-clamp-2">
                {comment.content}
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmitReply}>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {user && user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                maxLength={maxLength}
                className="w-full p-3 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-neutral-300 dark:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows="3"
                autoFocus
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-neutral-500">
                  {content.length}/{maxLength}
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={content.trim() === ''}
                    className={`px-4 py-2 text-sm rounded-lg text-white ${
                      content.trim() === ''
                        ? 'bg-gray-400 dark:bg-neutral-700 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    등록
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ... 필요한 다른 모달들 추가 ... 