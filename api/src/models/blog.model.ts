import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  mainImage: string;
  content: string;
  keywords: string[];
  excerpt: string;
  author: string;
  categories: string[];
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mainImage: { type: String, required: true },
    content: { type: String, required: true },
    keywords: [{ type: String, trim: true }],
    excerpt: { type: String, trim: true, default: '' },
    author: { type: String, trim: true },
    categories: [{ type: String, trim: true }],
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>('Blog', blogSchema);