import React from 'react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message,
  onRetry,
  retryText = 'Try Again',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'min-h-[200px] text-sm',
    md: 'min-h-[300px]',
    lg: 'min-h-[400px] text-lg'
  };

  return (
    <div className={`flex flex-col justify-center items-center text-center ${sizeClasses[size]} ${className}`}>
      <div 
        style={{
          padding: '2rem',
          backgroundColor: 'rgba(152, 94, 109, 0.2)',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-sunset)',
          maxWidth: '500px',
          width: '100%'
        }}
      >
        <h2 
          style={{ 
            color: 'var(--color-white)', 
            marginBottom: '1rem',
            fontSize: size === 'lg' ? '1.5rem' : size === 'sm' ? '1rem' : '1.25rem'
          }}
        >
          {title}
        </h2>
        <p 
          style={{ 
            color: 'var(--color-cloud)', 
            marginBottom: onRetry ? '1.5rem' : '0',
            lineHeight: '1.5'
          }}
        >
          {message}
        </p>
        {onRetry && (
          <Button variant="accent" onClick={onRetry}>
            {retryText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;