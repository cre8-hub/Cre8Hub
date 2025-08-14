const User = require('../models/userModel');
const { verifyJWT } = require('../utils/jwt');

// User sign in service
const signIn = async (email, password) => {
  try {
    // Find user by email and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: 'Account deactivated',
        details: 'Your account has been deactivated. Please contact support.'
      };
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      };
    }

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Sign in service error:', error);
    return {
      success: false,
      message: 'Authentication failed',
      details: 'An error occurred during sign in'
    };
  }
};

// User sign up service
const signUp = async (email, password, fullName, userRole) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        success: false,
        message: 'User already exists',
        details: 'An account with this email address already exists'
      };
    }

    // Create new user
    const userData = {
      email: email.toLowerCase(),
      password,
      fullName,
      userRole: userRole || null
    };

    const user = new User(userData);
    await user.save();

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Sign up service error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return {
        success: false,
        message: 'Validation failed',
        details: validationErrors.join(', ')
      };
    }

    return {
      success: false,
      message: 'Registration failed',
      details: 'An error occurred during registration'
    };
  }
};

// Get user by ID service
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        details: 'The requested user does not exist'
      };
    }

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Get user by ID service error:', error);
    return {
      success: false,
      message: 'Failed to fetch user',
      details: 'An error occurred while fetching user data'
    };
  }
};

// Update user profile service
const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        details: 'The requested user does not exist'
      };
    }

    // Update allowed fields
    const allowedFields = ['fullName', 'userRole', 'avatar'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return {
        success: false,
        message: 'No valid fields to update',
        details: 'Please provide at least one valid field to update'
      };
    }

    // Apply updates
    Object.assign(user, updates);
    await user.save();

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Update user profile service error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return {
        success: false,
        message: 'Validation failed',
        details: validationErrors.join(', ')
      };
    }

    return {
      success: false,
      message: 'Profile update failed',
      details: 'An error occurred while updating profile'
    };
  }
};

// Update specific profile data based on user role
const updateRoleSpecificProfile = async (userId, profileData) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        details: 'The requested user does not exist'
      };
    }

    // Update profile based on user role
    switch (user.userRole) {
      case 'content-creator':
        if (profileData.contentCreatorProfile) {
          Object.assign(user.contentCreatorProfile, profileData.contentCreatorProfile);
        }
        break;
      
      case 'entrepreneur':
        if (profileData.entrepreneurProfile) {
          Object.assign(user.entrepreneurProfile, profileData.entrepreneurProfile);
        }
        break;
      
      case 'social-media-manager':
        if (profileData.socialMediaManagerProfile) {
          Object.assign(user.socialMediaManagerProfile, profileData.socialMediaManagerProfile);
        }
        break;
      
      default:
        return {
          success: false,
          message: 'Invalid user role',
          details: 'User role is not set or invalid'
        };
    }

    // Mark profile as completed
    user.profileCompleted = true;
    await user.save();

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Update role specific profile service error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return {
        success: false,
        message: 'Validation failed',
        details: validationErrors.join(', ')
      };
    }

    return {
      success: false,
      message: 'Profile update failed',
      details: 'An error occurred while updating profile'
    };
  }
};

// Update persona data
const updatePersona = async (userId, personaData) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        details: 'The requested user does not exist'
      };
    }

    await user.updatePersona(personaData);

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Update persona service error:', error);
    return {
      success: false,
      message: 'Persona update failed',
      details: 'An error occurred while updating persona'
    };
  }
};

// Add past output
const addPastOutput = async (userId, outputData) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        details: 'The requested user does not exist'
      };
    }

    await user.addPastOutput(outputData);

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Add past output service error:', error);
    return {
      success: false,
      message: 'Failed to add past output',
      details: 'An error occurred while adding past output'
    };
  }
};

// Delete user account service
const deleteUserAccount = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        details: 'The requested user does not exist'
      };
    }

    // Delete user (all profile data is embedded, so it gets deleted automatically)
    await User.findByIdAndDelete(userId);

    return {
      success: true,
      message: 'Account deleted successfully'
    };

  } catch (error) {
    console.error('Delete user account service error:', error);
    return {
      success: false,
      message: 'Account deletion failed',
      details: 'An error occurred while deleting account'
    };
  }
};

// Get all users service (admin only)
const getAllUsers = async ({ page = 1, limit = 10, role, search }) => {
  try {
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { isActive: true };
    
    if (role) {
      query.userRole = role;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const totalUsers = await User.countDocuments(query);
    
    // Get users with pagination
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage,
        hasPrevPage,
        limit
      }
    };

  } catch (error) {
    console.error('Get all users service error:', error);
    return {
      success: false,
      message: 'Failed to fetch users',
      details: 'An error occurred while fetching users'
    };
  }
};

// Update last login service
const updateLastLogin = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    return { success: true };
  } catch (error) {
    console.error('Update last login service error:', error);
    return { success: false };
  }
};

// Refresh token service
const refreshToken = async (token) => {
  try {
    // Verify the token
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return {
        success: false,
        message: 'Invalid token',
        details: 'Token is not valid'
      };
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid token',
        details: 'User no longer exists'
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: 'Account deactivated',
        details: 'Your account has been deactivated'
      };
    }

    // Generate new token
    const { createJWT } = require('../utils/jwt');
    const newToken = createJWT({
      userId: user._id,
      email: user.email,
      userRole: user.userRole
    });

    return {
      success: true,
      token: newToken
    };

  } catch (error) {
    console.error('Refresh token service error:', error);
    return {
      success: false,
      message: 'Token refresh failed',
      details: 'An error occurred while refreshing token'
    };
  }
};

// Get user statistics service
const getUserStats = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    
    const roleStats = await User.aggregate([
      { $group: { _id: '$userRole', count: { $sum: 1 } } }
    ]);

    return {
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        roleBreakdown: roleStats
      }
    };

  } catch (error) {
    console.error('Get user stats service error:', error);
    return {
      success: false,
      message: 'Failed to fetch user statistics',
      details: 'An error occurred while fetching statistics'
    };
  }
};

module.exports = {
  signIn,
  signUp,
  getUserById,
  updateUserProfile,
  updateRoleSpecificProfile,
  updatePersona,
  addPastOutput,
  deleteUserAccount,
  getAllUsers,
  updateLastLogin,
  refreshToken,
  getUserStats
}; 