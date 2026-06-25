# 🎬 Movie Platform (Full-Stack)

A premium, feature-rich Full-Stack Movie and TV Show exploration platform built using the MERN stack (MongoDB, Express, React, Node.js). The application offers seamless media search and discovery powered by **TMDB API**, user profiles, watch history tracking, favorites lists, and a comprehensive **Admin Panel** for user and database management.

---

## 🚀 Key Features

### 👤 User Features
- **Secure Authentication:** JWT-based signup and login system with password hashing (`bcryptjs`) and secure cookies.
- **Media Catalog:** Browse trending and popular movies and TV shows across various genres.
- **Detailed Insights:** View individual media pages showing trailers (embedded YouTube players), description, release date, runtime, ratings, and genre tags.
- **Personalized Experience:**
  - **Favorites:** Add/remove items to/from your personal favorites list.
  - **Watch History:** Track viewed content with options to remove specific entries or clear all history.
- **Search System:** Search movies and TV shows instantly.

### 🛡️ Admin Dashboard (`/admin`)
- **Interactive Statistics:** Live insights on the user base, active movies, and database statistics.
- **User Management:**
  - List and search all registered users.
  - Ban/unban users to restrict or allow access.
  - Delete user accounts permanently.
  - Promote regular users to admin status.
- **Movie Database Management:**
  - Create new custom movies.
  - Edit/update metadata.
  - Toggle movie active/inactive status.
  - Delete movies permanently.

---

## 🛠️ Technology Stack

### Backend
- **Node.js & Express:** Scalable server architecture.
- **MongoDB & Mongoose:** Document database using schema definitions for users and custom movies.
- **Authentication:** JSON Web Tokens (JWT) with HTTP-only cookies and bcrypt-based password hashing.
- **Middleware:** Cors, Cookie-Parser, and custom route guard middlewares (`protect`, `adminOnly`).

### Frontend
- **React (Vite):** Lightweight, superfast frontend bundle development.
- **Redux Toolkit:** Centralized state management for authentication state, search context, and media listings.
- **Styling:** Custom Vanilla CSS for high performance, smooth gradients, and glassmorphic micro-animations.
- **Router:** React Router DOM (v6) for seamless client-side page routing.

### External APIs
- **TMDB (The Movie Database) API:** Source of rich, real-time movie & TV metadata.

---

## 📂 Project Structure

```text
MovieApp/
├── Backend/
│   ├── config/              # Database connection
│   ├── controllers/         # Request handling logic (Auth, User, Admin, Movie)
│   ├── middleware/          # JWT auth validation & role restrictions
│   ├── models/              # Mongoose Schemas (User.js, Movie.js)
│   ├── routes/              # Express API endpoints
│   ├── public/              # Production frontend static build assets
│   ├── .env                 # Environment variables configuration
│   ├── server.js            # Express server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── assets/          # Static images & icons
    │   ├── components/      # Reusable UI components (Navbar, Footer, etc.)
    │   ├── pages/           # Pages (Home, MovieDetail, AdminPanel, Favorites, etc.)
    │   ├── redux/           # Store setup & state slices (authSlice, movieSlice)
    │   ├── services/        # TMDB API helpers
    │   ├── App.jsx          # Route management
    │   ├── index.css        # Main stylesheet
    │   └── main.jsx         # App bootstrapping
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/yashdarji236/MovieApp.git
cd MovieApp
```

### 2. Configure Backend `.env`
Create a `.env` file inside the `Backend/` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original
NODE_ENV=development
```

### 3. Install Dependencies & Run

#### Backend Server
```bash
cd Backend
npm install
npm run dev
```

#### Frontend Client
```bash
cd ../frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173` on your browser!

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register user.
- `POST /api/auth/login` - Login and get cookies/token.
- `GET /api/auth/me` - Get logged-in user profile (Private).
- `POST /api/auth/logout` - Clear cookies and log out (Private).

### Users & Preferences (`/api/users`)
- `GET /api/users/favorites` - Get favorite movies list.
- `POST /api/users/favorites` - Add to favorites.
- `DELETE /api/users/favorites/:movieId` - Remove from favorites.
- `GET /api/users/history` - Get watch history.
- `POST /api/users/history` - Add movie/show to watch history.
- `DELETE /api/users/history/:movieId` - Remove specific item from history.
- `DELETE /api/users/history` - Clear entire watch history.

### Admin Operations (`/api/admin`)
- `GET /api/admin/stats` - Fetch dashboard statistics.
- `GET /api/admin/users` - Fetch and paginate all users.
- `PATCH /api/admin/users/:id/ban` - Ban user.
- `PATCH /api/admin/users/:id/unban` - Unban user.
- `PATCH /api/admin/users/:id/promote` - Promote user to Admin role.
- `DELETE /api/admin/users/:id` - Delete user account.
- `POST /api/admin/movies` - Add a new custom movie.
- `PUT /api/admin/movies/:id` - Update custom movie info.
- `DELETE /api/admin/movies/:id` - Delete movie.
