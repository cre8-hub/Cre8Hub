const userService = require('../services/userService');
const { createJWT } = require('../utils/jwt');

// User sign in
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          details: 'Please provide both email and password'
        }
      });
    }

    // Attempt to sign in user
    const result = await userService.signIn(email, password);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    // Create JWT token
    const token = createJWT({
      userId: result.user._id,
      email: result.user.email,
      userRole: result.user.userRole
    });

    // Update last login
    await userService.updateLastLogin(result.user._id);

    res.json({
      success: true,
      message: 'Sign in successful',
      data: {
        user: result.user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// User sign up
const signUp = async (req, res, next) => {
  try {
    const { email, password, fullName, userRole } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Required fields missing',
          details: 'Email, password, and full name are required'
        }
      });
    }

    // Attempt to create user
    const result = await userService.signUp(email, password, fullName, userRole);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    // Create JWT token
    const token = createJWT({
      userId: result.user._id,
      email: result.user.email,
      userRole: result.user.userRole
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await userService.getUserById(userId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: result.user.getPublicProfile()
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const result = await userService.updateUserProfile(userId, updateData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: result.user.getPublicProfile()
      }
    });

  } catch (error) {
    next(error);
  }
};

// Delete user account
const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await userService.deleteUserAccount(userId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully',
      details: 'Your account and all associated data have been permanently removed'
    });

  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const result = await userService.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      search
    });

    res.json({
      success: true,
      data: {
        users: result.users.map(user => user.getPublicProfile()),
        pagination: result.pagination
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await userService.getUserById(userId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: result.user.getPublicProfile()
      }
    });

  } catch (error) {
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Token is required',
          details: 'Please provide a valid token'
        }
      });
    }

    const result = await userService.refreshToken(token);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: result.token
      }
    });

  } catch (error) {
    next(error);
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
    details: 'Please remove the token from client-side storage'
  });
};

// Update role-specific profile
const updateRoleSpecificProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const profileData = req.body;

    const result = await userService.updateRoleSpecificProfile(userId, profileData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: result.user.getPublicProfile()
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update persona data
const updatePersona = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const personaData = req.body;

    const result = await userService.updatePersona(userId, personaData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    res.json({
      success: true,
      message: 'Persona updated successfully',
      data: {
        user: result.user.getPublicProfile()
      }
    });

  } catch (error) {
    next(error);
  }
};

// Add past output
const addPastOutput = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const outputData = req.body;

    const result = await userService.addPastOutput(userId, outputData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: result.message,
          details: result.details
        }
      });
    }

    res.json({
      success: true,
      message: 'Past output added successfully',
      data: {
        user: result.user.getPublicProfile()
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  signIn,
  signUp,
  getCurrentUser,
  updateUserProfile,
  updateRoleSpecificProfile,
  updatePersona,
  addPastOutput,
  deleteUserAccount,
  getAllUsers,
  getUserById,
  refreshToken,
  logout
}; 