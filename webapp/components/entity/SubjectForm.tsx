import React from 'react';

interface SubjectFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({ initialData, onSubmit, loading }) => {
  const [form, setForm] = React.useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    icon: initialData?.icon || '',
    class_id: initialData?.class_id || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input"
          required
        />
      </div>
      <div>
        <label className="block mb-1">Code</label>
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div>
        <label className="block mb-1">Icon</label>
        <input
          name="icon"
          value={form.icon}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div>
        <label className="block mb-1">Class ID</label>
        <input
          name="class_id"
          value={form.class_id}
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