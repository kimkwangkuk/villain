import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DropdownArrowIcon } from '../Icons';

const DropdownContext = React.createContext(null);

export const Dropdown = ({ children, selectedValue, onChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleItemSelect = (value) => {
    if (onChange) {
      onChange(value);
    }
    closeDropdown();
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const contextValue = {
    isOpen,
    toggleDropdown,
    closeDropdown,
    handleItemSelect,
    buttonRef,
    menuRef,
    position,
    selectedValue
  };

  return (
    <DropdownContext.Provider value={contextValue} {...props}>
      <div className="relative">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const Button = ({ children, ...props }) => {
  const { toggleDropdown, buttonRef, isOpen } = React.useContext(DropdownContext);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleDropdown}
      className="text-[15px] text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white px-[11px] py-[7px] pr-9 rounded-[8px] border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 font-medium min-w-[120px] bg-white dark:bg-neutral-800 relative text-left"
      {...props}
    >
      {children}
      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 dark:text-neutral-500">
        <DropdownArrowIcon className="w-4 h-4" />
      </span>
    </button>
  );
};

const Menu = ({ children, ...props }) => {
  const { isOpen, menuRef, position } = React.useContext(DropdownContext);

  if (!isOpen) return null;

  return createPortal(
    <div 
      ref={menuRef}
      className="fixed bg-white dark:bg-neutral-800 rounded-[8px] shadow-lg z-50 max-h-60 overflow-auto flex flex-col border border-gray-200 dark:border-neutral-700 mt-1"
      style={{
        top: `${position.top + 4}px`,
        left: `${position.left + position.width - Math.max(position.width, 120)}px`,
        width: `${Math.max(position.width, 120)}px`,
        minWidth: '120px',
        maxWidth: '300px'
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
};

const Item = ({ children, value, ...props }) => {
  const { handleItemSelect, selectedValue } = React.useContext(DropdownContext);
  const isSelected = value === selectedValue;

  return (
    <button 
      className={`w-full text-left px-4 py-3 text-[15px] hover:bg-gray-100 dark:hover:bg-neutral-700 block font-medium border-0 border-b border-gray-100 dark:border-neutral-800 last:border-0 ${
        isSelected 
        ? 'bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white' 
        : 'text-gray-700 dark:text-neutral-300'
      }`}
      onClick={() => handleItemSelect(value)}
      {...props}
    >
      {children}
    </button>
  );
};

Dropdown.Button = Button;
Dropdown.Menu = Menu;
Dropdown.Item = Item;

export default Dropdown; 