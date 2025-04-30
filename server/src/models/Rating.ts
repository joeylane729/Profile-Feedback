import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  profileId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bioRating: number;
  promptRatings: {
    [key: string]: number;
  };
  photoRatings: {
    [key: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>({
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bioRating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  promptRatings: {
    type: Map,
    of: {
      type: Number,
      min: 1,
      max: 10,
    },
    required: true,
  },
  photoRatings: {
    type: Map,
    of: {
      type: Number,
      min: 1,
      max: 10,
    },
    required: true,
  },
}, {
  timestamps: true,
});

// Create a compound index to ensure a user can only rate a profile once
RatingSchema.index({ profileId: 1, userId: 1 }, { unique: true });

export const Rating = mongoose.model<IRating>('Rating', RatingSchema); 