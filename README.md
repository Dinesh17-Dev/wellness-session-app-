# Wellness Session Management Platform 🧘‍♀️

This is a full-stack web application that allows users to register, login, and manage their wellness sessions. Users can create, save as draft, and publish sessions with tags. The app includes authentication, authorization, and dynamic session management.

## 🌟 Features

- User Registration & Login with JWT Authentication
- Secure Passwords using Bcrypt
- Create and edit wellness sessions
- Save sessions as drafts or publish them
- View all published sessions (public view)
- Protected routes using JWT
- Clean and intuitive frontend with React.js

## 🧱 Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **CSS:** Custom CSS with modern UI components
- **Other Libraries:** js-cookie, date-fns, react-router-dom

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <project-folder>


2. Install Dependencies
For Backend
bash
Copy
Edit
cd backend
npm install
For Frontend
bash
Copy
Edit
cd frontend
npm install
3. Setup Environment Variables
Create a .env file in the backend folder:

env
Copy
Edit
MONGO_URL=your_mongo_connection_string
Replace your_mongo_connection_string with your actual MongoDB connection URI.

4. Run the Application
Start Backend
bash
Copy
Edit
node index.js
Start Frontend
bash
Copy
Edit
npm start
The backend runs on http://localhost:5000
The frontend runs on http://localhost:3000

📂 Folder Structure
bash
Copy
Edit
📁 backend/
  ├── index.js
  ├── models/
  ├── routes/
  └── .env

📁 frontend/
  ├── Components/
  ├── App.js
  ├── index.js
  └── index.css
🧪 API Endpoints
Auth
POST /register – Create new user

POST /login – Login user and return JWT token

Session Management
POST /my-sessions/save-draft – Create or update a session (authenticated)

GET /sessions – Get all published sessions

GET /my-sessions – Get all sessions created by logged-in user

GET /my-sessions/:id – Get a specific session by ID (authenticated)

POST /my-sessions/publish – Publish a session by ID (authenticated)

🔐 Protected Routes (Frontend)
/ – View all sessions

/mysessions – View logged-in user sessions

/editor/:id? – Create or edit a session

/login – Login page

/register – Registration page

👤 Author
Dinesh Biddika
Developer and Designer for the Wellness Platform
Feel free to reach out for improvements or contributions!

📌 Notes
Ensure MongoDB is running locally or on Atlas before starting the server.

You must be logged in to access or edit sessions.

JWT token is stored using cookies for route protection.

🧼 To-Do (Improvements)
Add form validation for register/login

Include error pages (404/500)

Add filtering by tags for published sessions

Better error messages for backend responses