import mongoose from "mongoose";

export interface ICountry extends Document {
    name: string;
    code: string; // e.g., 'IN'
    default_language_id: mongoose.Types.ObjectId;
    supported_language_ids: mongoose.Types.ObjectId[];
}