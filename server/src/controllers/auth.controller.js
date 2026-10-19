import * as authService from '../services/auth.service.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';

export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password) {
      return apiError(res, 400, 'Full name, email, and password are required');
    }
    const data = await authService.registerUser({ fullName, email, phone, password });
    return apiResponse(res, 201, 'Registration successful', data);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return apiError(res, 400, 'Email and password are required');
    }
    const data = await authService.loginUser({ email, password });
    return apiResponse(res, 200, 'Login successful', data);
  } catch (err) {
    return apiError(res, 401, err.message);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    return apiResponse(res, 200, 'Profile fetched', user);
  } catch (err) {
    return apiError(res, 404, err.message);
  }
};

export const updateMe = async (req, res) => {
  try {
    const { fullName, phone, avatarUrl } = req.body;
    const user = await authService.updateUserProfile(req.user.id, { fullName, phone, avatarUrl });
    return apiResponse(res, 200, 'Profile updated', user);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const forgotPassword = async (req, res) => {
  return apiResponse(res, 200, 'Password reset instructions sent to your email (Demo: simulated)');
};

export const resetPassword = async (req, res) => {
  return apiResponse(res, 200, 'Password updated successfully');
};
