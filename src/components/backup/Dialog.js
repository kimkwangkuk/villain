import React from 'react';
import { PrimaryButton, LineButton } from './Button';

export default function Dialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  cancelText = "아니오", 
  confirmText = "네" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#242424] rounded-2xl p-6 max-w-sm mx-4 w-full shadow-lg dark:shadow-2xl">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-neutral-200">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-neutral-400 mb-4">
          {description}
        </p>
        <div className="flex justify-end space-x-2">
          <LineButton onClick={onClose}>
            {cancelText}
          </LineButton>
          <PrimaryButton onClick={onConfirm}>
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
} 