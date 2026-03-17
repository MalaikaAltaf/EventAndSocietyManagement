# EventifyHub

![EventifyHub Logo](https://via.placeholder.com/150x50?text=EventifyHub) <!-- Replace with actual logo if available -->

A comprehensive **Event and Society Management System** designed for educational institutions to streamline event organization, society management, and student participation. Built with a modern full-stack architecture, EventifyHub supports role-based access for Admins, Societies, and Students, ensuring efficient approval workflows and seamless user experiences.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: Secure JWT-based login/signup with role-based access (Admin, Society, Student)
- **Society Management**: Societies can register, manage members, and create events with approval workflows
- **Event Management**: Create, approve/reject events with seat booking, participant check-in, and status tracking
- **Student Portal**: Browse events, register, bookmark favorites, and view personal registrations
- **Admin Dashboard**: Oversee societies, events, and generate reports
- **Notifications System**: Real-time notifications for approvals, rejections, and updates
- **Responsive Design**: Mobile-friendly interface with professional UI

### Technical Highlights
- RESTful API architecture
- MongoDB database with Mongoose ODM
- Password hashing and secure authentication
- CORS-enabled for cross-origin requests
- Modular backend structure (controllers, models, routes, middleware)

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **Vanilla JavaScript** - Client-side logic
- **Fetch API** - HTTP requests

### Development Tools
- **Nodemon** - Development server auto-restart
- **Dotenv** - Environment variable management

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud instance like MongoDB Atlas) - [Download here](https://www.mongodb.com/)
- **Git** - For cloning the repository

## 🔧 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/eventifyhub.git
   cd eventifyhub
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the `backend` directory with the following:
   ```
   MONGO_URI=mongodb://localhost:27017/eventifyhub  # Or your MongoDB Atlas URI
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000  # Optional, defaults to 5000
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod  # Or use MongoDB Compass/Service
   ```

5. **Run the backend server**:
   ```bash
   npm run dev  # For development with auto-restart
   # or
   npm start    # For production
   ```
   The server will start on `http://localhost:5000`

6. **Open the frontend**:
   Open `frontend/public/index.html` in your web browser, or serve it via a local server (e.g., using VS Code Live Server extension).

## 📖 Usage

1. **Access the Application**:
   - Open your browser and navigate to the frontend HTML file
   - The backend API will be available at `http://localhost:5000/api/v1`

2. **User Roles & Workflows**:
   - **Students**: Register/login, browse events, register for events, manage bookmarks
   - **Societies**: Register/login, create/manage events, view participants
   - **Admins**: Login, approve/reject societies and events, view reports

3. **API Endpoints** (Key Examples):
   - `POST /api/v1/auth/register` - User registration
   - `POST /api/v1/auth/login` - User login
   - `GET /api/v1/events` - Fetch all events
   - `POST /api/v1/events` - Create new event (Society/Admin)
   - `GET /api/v1/societies` - Fetch societies
   - `PUT /api/v1/admin/approve-event/:id` - Approve event (Admin)

   For a complete API reference, see the backend routes in `backend/src/routes/`.

## 🏗 Project Structure

```
event-society-manager/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── eventController.js
│       │   └── ...
│       ├── middleware/
│       │   └── authMiddleware.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Event.js
│       │   └── ...
│       └── routes/
│           ├── api.js
│           └── ...
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   ├── images/
│   │   └── js/
│   ├── public/
│   │   └── index.html
│   └── views/
│       ├── admin/
│       ├── society/
│       └── student/
├── package.json
├── TODO.md
└── README.md
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License


