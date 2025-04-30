import mongoose, { Document, Schema } from 'mongoose';

export interface IPrompt {
  question: string;
  answer: string;
}

export interface IPhoto {
  url: string;
  order: number;
}

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  prompts: IPrompt[];
  photos: IPhoto[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  prompts: [{
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  }],
  photos: [{
    url: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema); 