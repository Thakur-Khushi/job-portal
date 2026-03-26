import React from 'react';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'red',
  onConfirm,
  onCancel,
  isLoading = false,
  icon = 'warning', // 'warning', 'error', 'success', 'info', 'question'
}) => {
  if (!isOpen) return null;

  const iconStyles = {
    warning: {
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconClass: 'text-yellow-600 dark:text-yellow-500',
      svg: '⚠️',
    },
    error: {
      bgClass: 'bg-red-100 dark:bg-red-900/20',
      iconClass: 'text-red-600 dark:text-red-500',
      svg: '❌',
    },
    success: {
      bgClass: 'bg-green-100 dark:bg-green-900/20',
      iconClass: 'text-green-600 dark:text-green-500',
      svg: '✓',
    },
    info: {
      bgClass: 'bg-blue-100 dark:bg-blue-900/20',
      iconClass: 'text-blue-600 dark:text-blue-500',
      svg: 'ℹ',
    },
    question: {
      bgClass: 'bg-purple-100 dark:bg-purple-900/20',
      iconClass: 'text-purple-600 dark:text-purple-500',
      svg: '❓',
    },
  }[icon] || {
    bgClass: 'bg-gray-100 dark:bg-gray-900/20',
    iconClass: 'text-gray-600 dark:text-gray-500',
    svg: '⚠️',
  };

  const confirmBtnColor =
    {
      red: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30',
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30',
      green:
        'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30',
      yellow:
        'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/30',
    }[confirmColor] ||
    'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 animate-slideDown border border-gray-100 dark:border-gray-700">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-full ${iconStyles.bgClass} flex items-center justify-center text-2xl`}
            >
              {iconStyles.svg}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-offset-gray-800"
            aria-label="Cancel action"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300 dark:focus:ring-offset-gray-800 ${confirmBtnColor}`}
            aria-label={confirmText}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
