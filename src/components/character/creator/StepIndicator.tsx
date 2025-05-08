import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {steps.map((stepName, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '9999px',
              backgroundColor:
                currentStep >= index + 1
                  ? 'var(--color-sat-purple)'
                  : 'var(--color-dark-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-white)',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
            }}
          >
            {index + 1}
          </div>
          <span
            style={{
              fontSize: '0.875rem',
              color: currentStep >= index + 1 ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
            }}
          >
            {stepName}
          </span>
          {index < steps.length - 1 && (
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '-50%',
                width: '100%',
                height: '2px',
                backgroundColor:
                  currentStep > index + 1
                    ? 'var(--color-sat-purple)'
                    : 'var(--color-dark-elevated)',
                zIndex: 0,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;