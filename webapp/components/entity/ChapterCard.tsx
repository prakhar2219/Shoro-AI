import React from 'react';

interface ChapterCardProps {
  chapter: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onEdit, onDelete }) => {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="font-bold text-lg">Chapter #{chapter.order}{chapter.title ? `: ${chapter.title}` : ''}</div>
      <div className="text-sm text-gray-500">Board: {chapter.board_id?.name || chapter.board_id || '-'}</div>
      <div className="text-sm text-gray-500">Class: {chapter.class_id?.name || chapter.class_id || '-'}</div>
      <div className="text-sm text-gray-500">Subject: {chapter.subject_id?.name || chapter.subject_id || '-'}</div>
      <div className="text-sm text-gray-500">Published: {chapter.is_published ? 'Yes' : 'No'}</div>
      <div className="flex gap-2 mt-2">
        {onEdit && (
          <button className="btn btn-sm btn-secondary" onClick={onEdit}>
            Edit
          </button>
        )}
        {onDelete && (
          <button className="btn btn-sm btn-danger" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}; 