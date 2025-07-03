import mongoose from "mongoose";

export interface IBoard extends Document {
    name: string;
    short_code: string;
    country_id: mongoose.Types.ObjectId;
    default_language_id: mongoose.Types.ObjectId;
    supported_language_ids: mongoose.Types.ObjectId[];
    description?: string;
    logo_url?: string;
}