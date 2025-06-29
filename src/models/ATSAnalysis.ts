import mongoose, { Schema } from 'mongoose';
import { IATSAnalysisRecord, IATSAnalysis } from '../types';

const atsAnalysisSchema = new Schema<IATSAnalysis>({
  resumeId: {
    type: String,
    ref: 'Resume',
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  feedback: {
    overall: {
      type: String,
      required: true,
      trim: true,
    },
    strengths: [{
      type: String,
      trim: true,
    }],
    weaknesses: [{
      type: String,
      trim: true,
    }],
    recommendations: [{
      type: String,
      trim: true,
    }],
  },
  keywords: {
    matched: [{
      type: String,
      trim: true,
    }],
    missing: [{
      type: String,
      trim: true,
    }],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    suggestions: [{
      type: String,
      trim: true,
    }],
  },
  formatting: {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    issues: [{
      type: String,
      trim: true,
    }],
    recommendations: [{
      type: String,
      trim: true,
    }],
  },
  completeness: {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    missingSection: [{
      type: String,
      trim: true,
    }],
    recommendations: [{
      type: String,
      trim: true,
    }],
  },
  suggestions: [{
    type: String,
    trim: true,
  }],
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const atsAnalysisRecordSchema = new Schema<IATSAnalysisRecord>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },
  resumeId: {
    type: String,
    ref: 'Resume',
  },
  jobDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: [10000, 'Job description cannot exceed 10000 characters'],
  },
  analysis: {
    type: atsAnalysisSchema,
    required: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
atsAnalysisRecordSchema.index({ userId: 1, createdAt: -1 });
atsAnalysisRecordSchema.index({ resumeId: 1 });
atsAnalysisRecordSchema.index({ 'analysis.score': -1 });
atsAnalysisRecordSchema.index({ createdAt: -1 });

// Static method to get user's analysis history
atsAnalysisRecordSchema.statics.getUserAnalyses = function(userId: string, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('resumeId', 'title personalInfo.firstName personalInfo.lastName');
};

// Static method to get average score for a user
atsAnalysisRecordSchema.statics.getUserAverageScore = async function(userId: string) {
  const result = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$analysis.score' },
        totalAnalyses: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0 ? result[0] : { averageScore: 0, totalAnalyses: 0 };
};

// Static method to get score distribution
atsAnalysisRecordSchema.statics.getScoreDistribution = async function() {
  return this.aggregate([
    {
      $bucket: {
        groupBy: '$analysis.score',
        boundaries: [0, 20, 40, 60, 80, 100],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          avgScore: { $avg: '$analysis.score' },
        },
      },
    },
  ]);
};

export default mongoose.model<IATSAnalysisRecord>('ATSAnalysis', atsAnalysisRecordSchema); 