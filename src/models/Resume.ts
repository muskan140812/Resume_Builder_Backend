import mongoose, { Schema } from 'mongoose';
import { IResume, IPersonalInfo, IWorkExperience, IEducation, IProject, ICertification, ISkill, ILanguage, ICustomSection } from '../types';

const personalInfoSchema = new Schema<IPersonalInfo>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  website: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  github: { type: String, trim: true },
  portfolio: { type: String, trim: true },
}, { _id: false });

const workExperienceSchema = new Schema<IWorkExperience>({
  id: { type: String, required: true },
  company: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrentJob: { type: Boolean, default: false },
  description: { type: String, required: true },
  achievements: [{ type: String, trim: true }],
}, { _id: false });

const educationSchema = new Schema<IEducation>({
  id: { type: String, required: true },
  institution: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  fieldOfStudy: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  gpa: { type: String, trim: true },
  achievements: [{ type: String, trim: true }],
}, { _id: false });

const projectSchema = new Schema<IProject>({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  technologies: [{ type: String, trim: true }],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  url: { type: String, trim: true },
  githubUrl: { type: String, trim: true },
  highlights: [{ type: String, trim: true }],
}, { _id: false });

const certificationSchema = new Schema<ICertification>({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  issuer: { type: String, required: true, trim: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date },
  credentialId: { type: String, trim: true },
  url: { type: String, trim: true },
}, { _id: false });

const skillSchema = new Schema<ISkill>({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical', 'Soft', 'Language', 'Tool', 'Framework'],
  },
}, { _id: false });

const languageSchema = new Schema<ILanguage>({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  proficiency: {
    type: String,
    required: true,
    enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
  },
}, { _id: false });

const customSectionSchema = new Schema<ICustomSection>({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['text', 'list'],
  },
  items: [{ type: String, trim: true }],
}, { _id: false });

const resumeSchema = new Schema<IResume>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  personalInfo: {
    type: personalInfoSchema,
    required: true,
  },
  careerObjective: {
    type: String,
    trim: true,
    maxlength: [500, 'Career objective cannot exceed 500 characters'],
  },
  workExperience: [workExperienceSchema],
  education: [educationSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  languages: [languageSchema],
  hobbies: [{
    type: String,
    trim: true,
  }],
  customSections: [customSectionSchema],
  templateId: {
    type: String,
    ref: 'Template',
  },
  version: {
    type: Number,
    default: 1,
  },
  isPublic: {
    type: Boolean,
    default: false,
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
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ templateId: 1 });
resumeSchema.index({ isPublic: 1 });
resumeSchema.index({ 'personalInfo.firstName': 'text', 'personalInfo.lastName': 'text', title: 'text' });

// Virtual for full name
resumeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Pre-save middleware to increment version
resumeSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

export default mongoose.model<IResume>('Resume', resumeSchema); 