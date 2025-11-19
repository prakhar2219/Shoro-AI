import React from 'react';

interface SubjectCardProps {
  subject: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onEdit, onDelete }) => {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="font-bold text-lg">{subject.name}</div>
      <div className="text-sm text-gray-500">Code: {subject.code}</div>
      <div className="text-sm text-gray-500">Icon: {subject.icon}</div>
      <div className="text-sm text-gray-500">Class ID: {subject.class_id}</div>
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