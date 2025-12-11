import React from 'react';
import { Badge } from '../../atoms';

interface CampaignCardProps {
  name: string;
  description: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
  onEdit?: () => void;
  onClick?: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  name,
  description,
  status,
  onEdit,
  onClick,
}) => {
  const statusColors = {
    active: 'success',
    draft: 'secondary',
    completed: 'info',
    paused: 'warning',
  } as const;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[status]} size="sm">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
    </div>
  );
};

