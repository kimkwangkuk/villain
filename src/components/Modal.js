import { useState } from 'react';

// 기본 모달 컴포넌트
function BaseModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            새로운 이름
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="새로운 이름을 입력하세요"
            maxLength={20}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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
        <p className="text-gray-600">정말 로그아웃 하시겠습니까?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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
        <p className="text-gray-600">정말 이 게시글을 삭제하시겠습니까?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            자기소개
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
            placeholder="자신을 소개해주세요"
            maxLength={200}
          />
          <p className="mt-1 text-sm text-gray-500">
            {bio.length}/200자
          </p>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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

// ... 필요한 다른 모달들 추가 ... 