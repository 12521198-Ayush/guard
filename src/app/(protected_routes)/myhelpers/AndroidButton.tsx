// components/AndroidButton.tsx
import React from 'react';

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

const AndroidButton = ({
  onClick,
  children,
  className = '',
  disabled = false,
  type = 'button',
}: Props) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`w-full py-3 rounded-2xl text-white text-base font-medium transition-all duration-200 
        ${disabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-green-600'} 
        shadow-md active:scale-[0.98] active:shadow-sm ${className}`}
    >
      {children}
    </button>
  );
};

export default AndroidButton;
