# RUNACOSS - Redeemer's University Association of Computer Science Students

A full-stack web application for the Redeemer's University Association of Computer Science Students, featuring a modern React frontend and Node.js backend.

## 🚀 Features

- **Modern Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Secure Backend**: Node.js + Express + MongoDB + JWT Authentication
- **User Authentication**: Login, registration, email verification
- **Blog System**: Create, read, update, delete blog posts
- **File Repository**: Upload, download, and manage files
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Error Handling**: Comprehensive error boundaries and loading states

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (version 8 or higher)
- **MongoDB** (running locally on port 27017)

### Installing MongoDB Locally

1. **Download MongoDB Community Server** from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **Install MongoDB** following the installation guide for your operating system
3. **Start MongoDB service**:
   - **Windows**: MongoDB should run as a service automatically
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd runacoss
```

### 2. Install Dependencies

Install all dependencies for both client and server:

```bash
npm run install:all
```

Or install them separately:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Environment Setup

1. **Copy the environment template**:
   ```bash
   cd server
   copy env.template .env
   ```

2. **Edit the `.env` file** with your configuration:
   ```env
   # Server Configuration
   PORT=3001
   
   # Database Configuration (Local MongoDB)
   MONGO_URI=mongodb://localhost:27017/runacoss
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   ACCESS_TOKEN_EXPIRES_IN=1h
   REFRESH_TOKEN_EXPIRES_IN=7d
   
   # Google OAuth Configuration (Optional - for email features)
   CLIENT_ID=your_google_client_id
   CLIENT_SECRET=your_google_client_secret
   REFRESH_TOKEN=your_google_refresh_token
   USER_EMAIL=your_gmail_address@gmail.com
   REDIRECT_URI=https://developers.google.com/oauthplayground
   
   # Frontend Configuration
   FRONTEND_BASE_URL=http://localhost:3000
   ```

#### Client Environment Setup (Optional)

1. **Copy the environment template**:
   ```bash
   cd client
   copy env.template .env
   ```

2. **Edit the `.env` file** if you need to change the API URL:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### 4. Start the Application

#### Development Mode (Recommended)

Run both client and server concurrently:

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

#### Production Mode

1. **Build the client**:
   ```bash
   npm run build
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

## 📁 Project Structure

```
runacoss/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── data/          # Static data
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   └── helpers/       # Utility functions
│   ├── uploads/           # File uploads directory
│   └── package.json
└── package.json           # Root package.json
```

## 🔧 Available Scripts

### Root Level Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run server:dev` - Start only the server in development mode
- `npm run client:dev` - Start only the client in development mode
- `npm run install:all` - Install dependencies for all packages
- `npm run build` - Build the client for production
- `npm start` - Start the server in production mode

### Client Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server Scripts

- `npm run dev` - Start with nodemon (development)
- `npm start` - Start in production mode

## 🔐 Authentication

The application uses JWT-based authentication with the following features:

- **Login/Register**: User registration and login
- **Email Verification**: Email verification for new accounts
- **Protected Routes**: Frontend routes that require authentication
- **Token Refresh**: Automatic token refresh mechanism
- **Secure Logout**: Proper session cleanup

## 📝 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token

### Users
- `POST /user` - Register new user
- `GET /user/me` - Get current user
- `GET /user/verify` - Verify email

### Blogs
- `GET /blogs` - Get all blogs (paginated)
- `GET /blogs/:id` - Get specific blog
- `POST /blogs` - Create new blog
- `PUT /blogs/:id` - Update blog
- `DELETE /blogs/:id` - Delete blog

### Files
- `POST /files/upload` - Upload file
- `GET /files` - Get all files (paginated)
- `GET /files/:id` - Get specific file
- `GET /files/:id/download` - Download file
- `DELETE /files/:id` - Delete file

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Express rate limiting middleware
- **CORS Protection**: Configured CORS for frontend-backend communication
- **Input Validation**: Express-validator for request validation
- **File Upload Security**: Multer with file type and size restrictions

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check if the connection string in `.env` is correct
   - Verify MongoDB is accessible on port 27017

2. **Port Already in Use**
   - Change the PORT in server `.env` file
   - Update VITE_API_URL in client `.env` file accordingly

3. **Module Not Found Errors**
   - Run `npm run install:all` to ensure all dependencies are installed
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

4. **CORS Errors**
   - Ensure FRONTEND_BASE_URL in server `.env` matches your frontend URL
   - Check that both client and server are running

### Development Tips

- Use `npm run dev` for development (runs both client and server)
- Check the browser console and server logs for errors
- Use the Network tab in browser dev tools to debug API calls
- MongoDB Compass can be helpful for database management

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please contact the RUNACOSS development team.