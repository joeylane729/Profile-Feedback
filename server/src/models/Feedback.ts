import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Create indexes
FeedbackSchema.index({ toUser: 1, createdAt: -1 });
FeedbackSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema); 