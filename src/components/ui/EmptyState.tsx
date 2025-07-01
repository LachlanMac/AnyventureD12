import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'accent' | 'ghost';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'min-h-[200px] p-4',
    md: 'min-h-[300px] p-8',
    lg: 'min-h-[400px] p-12',
  };

  const defaultIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-12 h-12"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );

  return (
    <div
      className={`flex flex-col justify-center items-center text-center ${sizeClasses[size]} ${className}`}
    >
      <div
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <div
          style={{
            width: size === 'sm' ? '3rem' : '4rem',
            height: size === 'sm' ? '3rem' : '4rem',
            borderRadius: '50%',
            backgroundColor: 'var(--color-stormy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cloud)',
          }}
        >
          {icon || defaultIcon}
        </div>
        <h2
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: size === 'lg' ? '1.75rem' : size === 'sm' ? '1.25rem' : '1.5rem',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            color: 'var(--color-cloud)',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: '1.5',
          }}
        >
          {description}
        </p>
        {action && (
          <Button variant={action.variant || 'accent'} onClick={action.onClick}>
            {action.text}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
