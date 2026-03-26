import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = '📭',
  title = 'No data found',
  description = 'There are no items to display',
  action = null,
  actionText = 'Go back',
  actionLink = '/',
}) => {
  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md w-full">
        {/* Icon Container */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 dark:bg-blue-900 rounded-full mb-6">
          <span className="text-5xl">{icon}</span>
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Action Button */}
        {action ? (
          action
        ) : (
          <Link
            to={actionLink}
            className="btn-modern inline-block hover:shadow-lg transition-all"
          >
            {actionText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
