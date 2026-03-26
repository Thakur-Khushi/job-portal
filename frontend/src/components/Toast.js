import React, { useEffect } from 'react';

const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 3000,
  position = 'bottom-right',
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const colors = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: '✓',
      light: 'bg-green-50 text-green-800 border-green-200',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: '✕',
      light: 'bg-red-50 text-red-800 border-red-200',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      icon: 'ℹ',
      light: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      icon: '⚠',
      light: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    },
  }[type];

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  }[position];

  return (
    <div
      className={`fixed ${positionClasses} z-50 animate-slide-down`}
      role="status"
      aria-live="polite"
      aria-label={`${type} notification`}
    >
      <div
        className={`${colors.bg} text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-max max-w-xs border-l-4`}
      >
        <span className="text-xl font-bold flex-shrink-0">{colors.icon}</span>
        <span className="font-medium text-sm md:text-base leading-tight">
          {message}
        </span>
      </div>
    </div>
  );
};

export default Toast;
