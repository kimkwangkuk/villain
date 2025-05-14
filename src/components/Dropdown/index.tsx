import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DropdownArrowIcon } from '../Icons';

interface DropdownContextProps {
  isOpen: boolean;
  toggleDropdown: () => void;
  closeDropdown: () => void;
  handleItemSelect: (value: string) => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  menuRef: React.RefObject<HTMLDivElement>;
  position: { top: number; left: number; width: number };
  selectedValue: string;
}

const DropdownContext = React.createContext<DropdownContextProps | null>(null);

interface DropdownProps {
  children: React.ReactNode;
  selectedValue: string;
  onChange?: (value: string) => void;
}

interface DropdownComponent extends React.FC<DropdownProps> {
  Button: React.FC<ButtonProps>;
  Menu: React.FC<MenuProps>;
  Item: React.FC<ItemProps>;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface MenuProps {
  children: React.ReactNode;
}

interface ItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  value: string;
}

export const Dropdown: DropdownComponent = ({ children, selectedValue, onChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleItemSelect = (value: string) => {
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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        event.target instanceof Node &&
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

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error('Button must be used within a Dropdown');
  const { toggleDropdown, buttonRef } = context;

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

const Menu: React.FC<MenuProps> = ({ children, ...props }) => {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error('Menu must be used within a Dropdown');
  const { isOpen, menuRef, position } = context;

  if (!isOpen || typeof window === 'undefined') return null;

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

const Item: React.FC<ItemProps> = ({ children, value, ...props }) => {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error('Item must be used within a Dropdown');
  const { handleItemSelect, selectedValue } = context;
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