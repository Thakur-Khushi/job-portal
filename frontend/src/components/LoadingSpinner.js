import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  inline = false,
  message = '',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-300 border-t-blue-500 border-r-purple-500 rounded-full animate-spin`}
      ></div>
      {message && (
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  if (inline) {
    return <div className="flex items-center gap-2">{spinner}</div>;
  }

  return (
    <div className="flex items-center justify-center py-12">{spinner}</div>
  );
};

export default LoadingSpinner;
