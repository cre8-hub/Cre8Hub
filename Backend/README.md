# Cre8Hub Backend API

A complete Node.js/Express backend for the Cre8Hub application with MongoDB, user authentication, profile management, and role-based access control.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Role-Based Access Control**: Support for content creators, entrepreneurs, and social media managers
- **Profile Management**: Comprehensive user profiles with specific role-based data
- **Database Integration**: MongoDB with Mongoose ODM for better data modeling
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Comprehensive error handling with detailed logging
- **API Documentation**: Well-structured RESTful API endpoints

## 🏗️ Architecture

```
Backend/
├── src/
│   ├── config/          # MongoDB configuration
│   ├── models/          # Mongoose data models
│   ├── middleware/      # Authentication, validation, error handling
│   ├── routes/          # API route handlers
│   ├── database/        # Seeding scripts
│   └── server.js        # Main server file
├── package.json         # Dependencies and scripts
└── env.example          # Environment variables template
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher) - Local or MongoDB Atlas
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/cre8hub
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up MongoDB**
   
   **Option A: Local MongoDB**
   ```bash
   # Install MongoDB locally
   # macOS (using Homebrew)
   brew install mongodb-community
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo apt-get install mongodb
   sudo systemctl start mongod
   
   # Windows
   # Download and install from mongodb.com
   ```

   **Option B: MongoDB Atlas (Cloud)**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster
   - Get connection string and update MONGODB_URI in .env

5. **Seed the database with sample data (optional)**
   ```bash
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## 📊 Database Schema

### Core Collections

- **users**: Main user information and authentication
- **contentcreatorprofiles**: Content creator specific data
- **entrepreneurprofiles**: Entrepreneur specific data
- **socialmediamanagerprofiles**: Social media manager specific data

### User Roles

- `content-creator`: Content creators with genre preferences and audience data
- `entrepreneur`: Business owners with business details and marketing needs
- `social-media-manager`: SMM professionals with services and client portfolio
- `admin`: Administrative users with full access

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:userId` - Get user by ID (admin only)

### Profile Management
- `POST /api/profiles/content-creator` - Create content creator profile
- `POST /api/profiles/entrepreneur` - Create entrepreneur profile
- `POST /api/profiles/social-media-manager` - Create SMM profile
- `GET /api/profiles/my-profile` - Get user's specific profile
- `PUT /api/profiles/content-creator` - Update content creator profile
- `PUT /api/profiles/entrepreneur` - Update entrepreneur profile
- `PUT /api/profiles/social-media-manager` - Update SMM profile

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express
- **MongoDB Injection Protection**: Mongoose schema validation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/cre8hub` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🔄 Database Operations

### Seeding
```bash
npm run seed
```

**Note**: Unlike PostgreSQL, MongoDB doesn't require explicit migrations. The database structure is defined by the Mongoose schemas and will be created automatically when you first save documents.

## 📱 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": "Additional error details"
  }
}
```

## 🚨 Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication failures
- Database errors
- JWT token issues
- Rate limiting violations

## 🔧 Development

### Project Structure
- **Modular Architecture**: Separated concerns with clear file organization
- **Mongoose Models**: Rich data models with validation and methods
- **Middleware Pattern**: Reusable authentication and validation middleware
- **Route Organization**: Logical grouping of related endpoints

### Adding New Features
1. Create new models in `src/models/`
2. Add routes in `src/routes/`
3. Add validation in `src/middleware/validation.js`
4. Add tests for new functionality

## 📚 Dependencies

### Core Dependencies
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `express-validator`: Input validation

### Security Dependencies
- `helmet`: Security headers
- `cors`: Cross-origin resource sharing
- `express-rate-limit`: Rate limiting

### Development Dependencies
- `nodemon`: Auto-restart on file changes
- `jest`: Testing framework
- `supertest`: API testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review error logs
- Check MongoDB connectivity
- Verify environment variables

## 🔮 Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] File upload support
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] API rate limiting per user
- [ ] MongoDB aggregation pipelines
- [ ] Caching layer (Redis)
- [ ] WebSocket support
- [ ] GraphQL API

## 🆚 MongoDB vs PostgreSQL

### Why MongoDB for Cre8Hub?

**Flexibility**: 
- Easy to modify schemas as requirements change
- No need for complex migrations
- Better for rapid prototyping

**Document Structure**:
- Natural fit for user profiles with varying data
- Rich nested objects (social media links, portfolios)
- Easy to add new fields without breaking existing data

**Scalability**:
- Horizontal scaling with sharding
- Better for read-heavy operations
- JSON-like document structure

**Development Speed**:
- Faster development cycles
- Less time on schema design
- Easy to iterate and improve 