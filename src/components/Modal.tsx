import { useState, useEffect, useRef } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';
// import { uploadImage } from '@/api/firebase-post';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// 기본 모달 컴포넌트
function BaseModal({ isOpen, onClose, title, children }: BaseModalProps) {
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

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

// 확인 모달 컴포넌트 (예/아니요 스타일)
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-[16px] w-[320px] overflow-hidden">
        <div className="px-[20px] py-[30px] text-center">
          <h2 className="text-[17px] font-bold mb-4 text-center text-black dark:text-white">{title}</h2>
          <p className="text-[15px] font-normal text-gray-700 dark:text-neutral-300 text-center">{message}</p>
        </div>
        
        <div className="flex border-t border-gray-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="flex-1 py-[14px] px-[8px] text-[15px] font-bold text-black dark:text-white border-r border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            아니요
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-[14px] px-[8px] text-[15px] font-bold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            네
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (displayName: string) => void;
  initialValue?: string;
  error?: string;
}

// 이름 변경 모달
export function EditNameModal({ isOpen, onClose, onSubmit, initialValue = '', error }: EditNameModalProps) {
  const [displayName, setDisplayName] = useState(initialValue);
  const [localError, setLocalError] = useState<string | undefined>(error);
  
  // 외부 에러 프롭이 변경되면 로컬 에러 상태도 업데이트
  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const validateName = (): boolean => {
    if (!displayName || displayName.trim() === '') {
      setLocalError('이름을 입력해주세요.');
      return false;
    }
    
    if (displayName.length > 20) {
      setLocalError('이름은 최대 20자까지 입력 가능합니다.');
      return false;
    }
    
    setLocalError(undefined);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateName()) {
    onSubmit(displayName);
    }
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
            onChange={(e) => {
              setDisplayName(e.target.value);
              // 입력 시 이전 에러 메시지 제거
              if (localError) setLocalError(undefined);
            }}
            className={`block w-full px-3 py-2 border ${localError ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-neutral-700'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-300`}
            placeholder="새로운 이름을 입력하세요"
            maxLength={20}
            autoFocus
          />
          {localError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{localError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-500">
            {displayName.length}/20자
          </p>
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
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              !displayName.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={!displayName.trim()}
          >
            저장
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 로그아웃 확인 모달
export function LogoutConfirmModal({ isOpen, onClose, onConfirm }: ConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="삭제하시겠습니까?"
      message="지금 삭제하면 되돌릴 수 없습니다. 그래도 삭제할래요?"
    />
  );
}

// 게시글 삭제 확인 모달
export function DeletePostConfirmModal({ isOpen, onClose, onConfirm }: ConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="삭제하시겠습니까?"
      message="지금 삭제하면 되돌릴 수 없습니다. 그래도 삭제할래요?"
    />
  );
}

interface EditBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bio: string) => void;
  initialValue?: string;
  error?: string;
}

// 자기소개 수정 모달
export function EditBioModal({ isOpen, onClose, onSubmit, initialValue = '', error }: EditBioModalProps) {
  const [bio, setBio] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
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

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  currentImage?: string;
}

// 프로필 이미지 선택 모달
export function ProfileImageModal({ isOpen, onClose, onSelect, currentImage }: ProfileImageModalProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileImages = async () => {
      const storage = getStorage();
      const imageUrls: string[] = [];
      let loadedCount = 0;
      
      try {
        console.log('프로필 이미지 로드 시작');
        console.log('현재 Storage 버킷:', storage.app.options.storageBucket);
        
        // 다양한 이미지 패턴을 시도합니다
        const patterns = [
          'profile', 'avatar', 'user', 'person', 
          'woman', 'man', 'default', 'icon', 'pic'
        ];
        
        // 개발 환경 여부 확인 (테스트용)
        const isDevelopment = process.env.NODE_ENV === 'development';
        console.log('개발 환경 여부:', isDevelopment);
        
        // 각 패턴별로 최대 5개까지 시도 (개수 줄임)
        for (const pattern of patterns) {
          for (let i = 1; i <= 5; i++) {
            try {
              // 에뮬레이터와 실제 서비스 모두 시도
              const imagePath = `profile_images/${pattern}${i}.webp`;
              console.log(`이미지 로드 시도: ${imagePath}`);
              
              const imageRef = ref(storage, imagePath);
              console.log('이미지 참조 URL:', imageRef.toString());
              
          const url = await getDownloadURL(imageRef);
          imageUrls.push(url);
              loadedCount++;
              console.log(`이미지 로드 성공: ${pattern}${i}.webp - URL: ${url}`);
              
              // 이미지가 충분히 로드되면 중단
              if (loadedCount >= 15) break;
            } catch (imgError: any) {
              // 더 자세한 오류 정보 로깅
              console.error(`이미지 로드 실패: ${pattern}${i}.webp - 오류:`, 
                imgError.code, imgError.message);
            }
          }
          
          // 이미지가 충분히 로드되면 중단
          if (loadedCount >= 15) break;
        }
        
        // 안전한 기본 이미지 추가 (이미지가 없는 경우를 대비)
        if (imageUrls.length === 0) {
          // 기본 이미지 하드코딩 (최악의 경우를 대비)
          imageUrls.push('https://via.placeholder.com/150?text=User1');
          imageUrls.push('https://via.placeholder.com/150?text=User2');
          imageUrls.push('https://via.placeholder.com/150?text=User3');
          console.log('외부 기본 이미지를 사용합니다.');
        }

        console.log(`총 ${imageUrls.length}개의 이미지를 로드했습니다.`);
        setImages(imageUrls);
        setError(null);
      } catch (error) {
        console.error('이미지 로딩 실패:', error);
        setError('프로필 이미지를 불러오는데 실패했습니다.');
        
        // 오류 발생 시에도 기본 이미지 제공
        setImages([
          'https://via.placeholder.com/150?text=User1',
          'https://via.placeholder.com/150?text=User2',
          'https://via.placeholder.com/150?text=User3'
        ]);
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
      ) : error ? (
        <div className="text-center py-4 text-red-500 dark:text-red-400">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
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

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<boolean> | boolean;
  commentAuthor: string;
}

// 대댓글 작성 모달
export const ReplyModal = ({ isOpen, onClose, onSubmit, commentAuthor }: ReplyModalProps) => {
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const maxLength = 300;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() === '') return;
    await onSubmit(content);
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
        
        <div className="flex space-x-3 mb-4 bg-gray-100 dark:bg-neutral-800 p-3 rounded-lg">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {commentAuthor?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-neutral-300">
              {commentAuthor || '익명'}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmitReply}>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {user && user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || ''} 
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
                rows={3}
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