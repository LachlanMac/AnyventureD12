import React, { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
  onClick?: () => void;
  hoverEffect?: boolean;
  style?: React.CSSProperties;
}
const Card: React.FC<CardProps> = ({
  className = '',
  children,
  variant = 'default',
  onClick,
  hoverEffect = false,
  style,
}) => {
  // Base classes
  let cardClasses = 'rounded-lg overflow-hidden transition-all duration-200';

  // Interactive props
  const interactive = onClick ? 'cursor-pointer' : '';

  // Hover effect class
  const hoverClasses = hoverEffect ? 'hover-lift' : '';

  // Combine classes
  cardClasses = `${cardClasses} ${interactive} ${hoverClasses} ${className}`;

  // Get variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: 'var(--color-dark-surface)',
          border: 'none',
        };
      case 'elevated':
        return {
          backgroundColor: 'var(--color-dark-surface)',
          border: 'none',
          boxShadow: 'var(--shadow-app)',
        };
      case 'bordered':
        return {
          backgroundColor: 'var(--color-dark-surface)',
          border: '1px solid var(--color-dark-border)',
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(25, 34, 49, 0.6)', // evening with opacity
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        };
      default:
        return {};
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <div className={cardClasses} onClick={onClick} style={{ ...variantStyle, ...style }}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children, style }) => {
  return (
    <div
      className={`p-4 ${className}`}
      style={{
        borderBottom: '1px solid var(--color-dark-border)',
        backgroundColor: 'var(--color-dark-elevated)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

interface CardBodyProps {
  className?: string;
  children: ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({ className = '', children }) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => {
  return (
    <div
      className={`p-4 ${className}`}
      style={{
        borderTop: '1px solid var(--color-dark-border)',
        backgroundColor: 'var(--color-dark-elevated)',
      }}
    >
      {children}
    </div>
  );
};

export default Card;
