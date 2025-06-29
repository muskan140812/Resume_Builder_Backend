import { Request } from 'express';
import { Document } from 'mongoose';
import { analyzeResumeText } from '../utils/atsAnalyzer';

// User Types
export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokens: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

// Resume Types
export interface IPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface IWorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  isCurrentJob: boolean;
  description: string;
  achievements: string[];
}

export interface IEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  gpa?: string;
  achievements: string[];
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: Date;
  endDate?: Date;
  url?: string;
  githubUrl?: string;
  highlights: string[];
}

export interface ICertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  url?: string;
}

export interface ISkill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Technical' | 'Soft' | 'Language' | 'Tool' | 'Framework';
}

export interface ILanguage {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface ICustomSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'list';
  items?: string[];
}

export interface IResume extends Document {
  _id: string;
  userId: string;
  title: string;
  personalInfo: IPersonalInfo;
  careerObjective: string;
  workExperience: IWorkExperience[];
  education: IEducation[];
  skills: ISkill[];
  projects: IProject[];
  certifications: ICertification[];
  languages: ILanguage[];
  hobbies: string[];
  customSections: ICustomSection[];
  templateId?: string;
  version: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Template Types
export interface ITemplate extends Document {
  _id: string;
  name: string;
  description: string;
  category: 'Modern' | 'Classic' | 'ATS-Friendly' | 'Creative';
  thumbnail: string;
  isPremium: boolean;
  isActive: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  layout: {
    columns: number;
    spacing: 'compact' | 'normal' | 'spacious';
  };
  createdBy: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ATS Analysis Types
export interface IATSAnalysis {
  resumeId?: string;
  score: number;
  feedback: {
    overall: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  keywords: {
    matched: string[];
    missing: string[];
    score: number;
    suggestions: string[];
  };
  formatting: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  completeness: {
    score: number;
    missingSection: string[];
    recommendations: string[];
  };
  suggestions: string[];
  analyzedAt: Date;
}

export interface IATSAnalysisRecord extends Document {
  _id: string;
  userId: string;
  resumeId?: string;
  jobDescription: string;
  analysis: IATSAnalysis;
  createdAt: Date;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface IAuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: { [key: string]: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File Upload Types
export interface IFileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Email Types
export interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Validation Error Types
export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

// Database Query Types
export interface IQueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  populate?: string;
}

// Filter Types
export interface IResumeFilters {
  userId?: string;
  templateId?: string;
  isPublic?: boolean;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IUserFilters {
  role?: string;
  isEmailVerified?: boolean;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Statistics Types
export interface IDashboardStats {
  totalUsers: number;
  totalResumes: number;
  totalAnalyses: number;
  activeUsers: number;
  popularTemplates: Array<{
    templateId: string;
    name: string;
    usageCount: number;
  }>;
}

export interface IUserStats {
  resumeCount: number;
  analysisCount: number;
  lastActivity: Date;
  mostUsedTemplate?: string;
} 


