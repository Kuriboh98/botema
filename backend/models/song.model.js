import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        artist: { type: String, required: true },
        previewUrl: { type: String, required: true },
        coverUrl: { type: String },
        year: { type: Number }, 
        genre: { type: String },
        itunesId: { type: String, required: true, unique: true }, 
    },
    { timestamps: true }
);

export const Song = mongoose.model('Song', songSchema);
