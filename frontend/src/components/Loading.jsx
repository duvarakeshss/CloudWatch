import React from 'react';

const Loading = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className = '',
  showText = true,
  variant = 'spinner' // spinner, dots, pulse
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const renderSpinner = () => (
    <div
      className={`animate-spin border-2 border-[var(--primary-color)] border-t-transparent rounded-full ${sizeClasses[size]} ${className}`}
    />
  );

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`bg-[var(--primary-color)] rounded-full animate-bounce ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-6 w-6'}`} style={{ animationDelay: '0ms' }}></div>
      <div className={`bg-[var(--primary-color)] rounded-full animate-bounce ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-6 w-6'}`} style={{ animationDelay: '150ms' }}></div>
      <div className={`bg-[var(--primary-color)] rounded-full animate-bounce ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-6 w-6'}`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-[var(--primary-color)] rounded-full animate-pulse ${sizeClasses[size]} ${className}`}></div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  const loader = (
    <div className="flex flex-col items-center justify-center">
      {renderLoader()}
      {showText && text && (
        <p className="mt-3 text-sm text-[var(--subtle-text-color)] font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[var(--background-color)] bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return loader;
};

// Additional loading components for specific use cases
export const PageLoading = ({ text = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--background-color)]">
    <Loading size="xl" text={text} />
  </div>
);

export const CardLoading = ({ text = 'Loading...' }) => (
  <div className="bg-[var(--card-background)] rounded-lg p-8 border border-[var(--border-color)]/50 shadow-sm flex items-center justify-center">
    <Loading size="lg" text={text} />
  </div>
);

export const InlineLoading = ({ text, size = 'sm' }) => (
  <div className="flex items-center space-x-2">
    <Loading size={size} showText={false} />
    {text && <span className="text-sm text-[var(--subtle-text-color)]">{text}</span>}
  </div>
);

export default Loading;