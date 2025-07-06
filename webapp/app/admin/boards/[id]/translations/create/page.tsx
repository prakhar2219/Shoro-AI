"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function CreateBoardTranslationPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState({ language: '', name: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTranslation({ ...translation, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // await createBoardTranslation(params.id, translation);
    setLoading(false);
    router.push(`/admin/boards/${params.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Board Translation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Language</label>
          <input
            name="language"
            value={translation.language}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Name</label>
          <input
            name="name"
            value={translation.name}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
} 