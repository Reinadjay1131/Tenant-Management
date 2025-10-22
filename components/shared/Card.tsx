import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  className = '', 
  titleClassName = '',
  variant = 'default',
  padding = 'lg'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white shadow-medium border border-neutral-200/50';
      case 'glass':
        return 'glass-effect shadow-soft';
      case 'bordered':
        return 'bg-white border-2 border-brand-200 shadow-soft';
      default:
        return 'bg-white shadow-soft border border-neutral-200/30';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  return (
    <div className={`
      ${getVariantClasses()}
      ${getPaddingClasses()}
      rounded-xl 
      transition-all 
      duration-300 
      hover:shadow-medium 
      animate-fade-in
      ${className}
    `}>
      {title && (
        <div className="mb-6 pb-4 border-b border-neutral-100">
          <h3 className={`
            text-xl 
            font-semibold 
            text-neutral-900 
            tracking-tight
            ${titleClassName}
          `}>
            {title}
          </h3>
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
