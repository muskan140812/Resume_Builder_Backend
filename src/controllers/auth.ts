import { Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';

// Register a new user
export const register = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });

    await user.save();

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    const response: ApiResponse = {
      success: true,
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
      },
      message: 'User registered successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
};

// Login user
export const login = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Find user with password field included
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    console.log(user);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    const response: ApiResponse = {
      success: true,
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
      },
      message: 'Login successful',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
};

// Logout user
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { refreshToken } = req.body;
    const user = req.user!;

    // Remove refresh token
    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
};

// Refresh access token
export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'
    ) as any;

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token',
    });
  }
};

// Forgot password
export const forgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Here you would send an email with the reset token
    // For now, we'll just return it in development mode
    const responseData = process.env.NODE_ENV === 'development' 
      ? { resetToken } 
      : undefined;

    res.status(200).json({
      success: true,
      data: responseData,
      message: 'Password reset instructions sent to your email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process forgot password request',
    });
  }
};

// Reset password
export const resetPassword = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Clear all refresh tokens

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    });
  }
};

// Verify email
export const verifyEmail = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification token',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email',
    });
  }
};

// Resend verification email
export const resendVerification = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified',
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;

    await user.save();

    // Here you would send a verification email
    // For now, we'll just return the token in development mode
    const responseData = process.env.NODE_ENV === 'development' 
      ? { verificationToken } 
      : undefined;

    res.status(200).json({
      success: true,
      data: responseData,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email',
    });
  }
};

// Get user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const user = req.user!;

    res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
    });
  }
}; 