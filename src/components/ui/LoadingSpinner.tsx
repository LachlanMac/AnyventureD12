import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  message,
}) => {
  const sizeClasses = {
    sm: 'min-h-[200px]',
    md: 'min-h-[400px]',
    lg: 'min-h-[50vh]',
  };

  return (
    <div className={`flex flex-col justify-center items-center ${sizeClasses[size]} ${className}`}>
      <div className="loading-spinner"></div>
      {message && (
        <p
          style={{
            color: 'var(--color-cloud)',
            marginTop: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
