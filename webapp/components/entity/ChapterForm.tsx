import React from 'react';

interface ChapterFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const ChapterForm: React.FC<ChapterFormProps> = ({ initialData, onSubmit, loading }) => {
  const [form, setForm] = React.useState({
    subject_id: initialData?.subject_id || '',
    order: initialData?.order || '',
    is_published: initialData?.is_published || false,
    created_by: initialData?.created_by || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Subject ID</label>
        <input
          name="subject_id"
          value={form.subject_id}
          onChange={handleChange}
          className="input"
          required
        />
      </div>
      <div>
        <label className="block mb-1">Order</label>
        <input
          name="order"
          type="number"
          value={form.order}
          onChange={handleChange}
          className="input"
          required
        />
      </div>
      <div>
        <label className="block mb-1">Is Published</label>
        <input
          name="is_published"
          type="checkbox"
          checked={form.is_published}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="block mb-1">Created By (User ID)</label>
        <input
          name="created_by"
          value={form.created_by}
          onChange={handleChange}
          className="input"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}; 