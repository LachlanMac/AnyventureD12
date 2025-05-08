import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  // Base classes
  let classes =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  // Width
  const widthClass = fullWidth ? 'w-full' : '';

  // Disabled state
  const disabledClass = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';

  // Combine all classes
  classes = `${classes} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

  // Build variant-specific styles using CSS variables
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-stormy)',
          color: 'var(--color-white)',
          border: 'none',
          '--hover-bg': 'rgba(73, 78, 107, 0.9)', // --color-stormy with opacity
          '--active-bg': 'var(--color-stormy)',
          '--ring-color': 'rgba(73, 78, 107, 0.5)', // --color-stormy with opacity
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--color-evening)',
          color: 'var(--color-white)',
          border: 'none',
          '--hover-bg': 'rgba(25, 34, 49, 0.9)', // --color-evening with opacity
          '--active-bg': 'var(--color-evening)',
          '--ring-color': 'rgba(25, 34, 49, 0.5)', // --color-evening with opacity
        };
      case 'accent':
        return {
          backgroundColor: 'var(--color-metal-gold)',
          color: 'var(--color-dark-base)',
          border: 'none',
          '--hover-bg': 'var(--color-old-gold)',
          '--active-bg': 'var(--color-metal-gold)',
          '--ring-color': 'rgba(215, 183, 64, 0.5)', // --color-metal-gold with opacity
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-white)',
          border: '1px solid var(--color-dark-border)',
          '--hover-bg': 'var(--color-dark-elevated)',
          '--active-bg': 'var(--color-dark-elevated)',
          '--ring-color': 'rgba(255, 255, 255, 0.25)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-white)',
          border: 'none',
          '--hover-bg': 'rgba(255, 255, 255, 0.1)',
          '--active-bg': 'rgba(255, 255, 255, 0.15)',
          '--ring-color': 'rgba(255, 255, 255, 0.25)',
        };
      default:
        return {};
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      style={{
        ...variantStyle,
        ...(rest.style || {}),
      }}
      onMouseOver={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = variantStyle['--hover-bg'] as string;
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = variantStyle.backgroundColor as string;
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = variantStyle['--active-bg'] as string;
        }
      }}
      onFocus={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${variantStyle['--ring-color']}`;
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
      {...rest}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
