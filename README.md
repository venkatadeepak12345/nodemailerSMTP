# Full-Stack Email Service Application

A production-ready full-stack Email Service application implementing secure authentication (JWT), Multi-Factor Authentication via One-Time Passwords (OTP), automated welcome emails, transactional confirmations (invoices), password recovery flows, and Contact Us forms.

## 🚀 Tech Stack

*   **Frontend**: React.js (Vite, React Router v6, Axios)
*   **Backend**: Node.js & Express.js
*   **Database**: PostgreSQL
*   **Email Library**: Nodemailer (SMTP transport with Ethereal fallback)
*   **Authentication**: JSON Web Tokens (JWT) & Bcryptjs password hashing
*   **Configuration**: Dotenv environment variables
*   **Styling**: Premium Custom Vanilla CSS (Glassmorphic dark slate UI)

---

## 📂 Folder Structure

```
d:\nodemailer
├── database/
│   └── schema.sql                    # PostgreSQL schema definitions & indices
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # PostgreSQL Pool & test connection setup
│   │   │   └── mail.js               # Nodemailer SMTP & Ethereal setup
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, logins, OTPs & passwords
│   │   │   ├── contactController.js  # Public feedback form to Admin email
│   │   │   └── actionController.js   # Order/Action confirmations trigger
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT token decoding and route protection
│   │   │   └── rateLimiter.js        # IP rate limiter for brute-force defense
│   │   ├── services/
│   │   │   ├── emailService.js       # Custom HTML email templates & mail delivery
│   │   │   ├── otpService.js         # OTP lifecycle management (SHA-256 hashed)
│   │   │   └── tokenService.js       # Reset token lifecycle management (SHA-256)
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Signup, login, reset password, OTP routes
│   │   │   ├── contactRoutes.js      # Contact form routes
│   │   │   └── actionRoutes.js       # Transactional activity routes
│   │   ├── app.js                    # Express app configuration & middleware pipeline
│   │   └── index.js                  # Entry server startup listener
│   ├── .env.example                  # Environment configuration template
│   ├── .env                          # Local environment settings
│   └── package.json                  # Node backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx             # Visual status notifications (Success/Error)
│   │   │   └── Loader.jsx            # Dynamic page spinner overlay
│   │   ├── pages/
│   │   │   ├── Register.jsx          # Signup form
│   │   │   ├── Login.jsx             # Login form
│   │   │   ├── VerifyOtp.jsx         # Verification screen (MFA/Verification)
│   │   │   ├── ForgotPassword.jsx    # Reset recovery trigger form
│   │   │   ├── ResetPassword.jsx     # New password specifying form
│   │   │   ├── ContactUs.jsx         # Message form to admin
│   │   │   └── Dashboard.jsx         # Protected page containing confirmation tests
│   │   ├── services/
│   │   │   └── api.js                # Custom Axios client with JWT interceptors
│   │   ├── App.jsx                   # React application router
│   │   ├── index.css                 # Custom glassmorphic styling sheet
│   │   └── main.jsx                  # React bootstrapper
│   ├── package.json                  # React build dependencies
│   ├── vite.config.js                # Vite configs
│   └── index.html                    # HTML web template
├── docker-compose.yml                # Instant PostgreSQL container runner
└── README.md                         # Setup & Operations manual (this file)
```

---

## 🛠️ Step-by-Step Setup Instructions

### 1. Database Setup (PostgreSQL)

You can launch a PostgreSQL instance instantly via **Docker Compose** or run the tables on an existing local database.

#### Option A: Docker Compose (Recommended)
Make sure Docker is running on your machine, then run:
```bash
docker-compose up -d
```
This boots up a PostgreSQL container on port `5432` and automatically runs the initialization schema script [database/schema.sql](file:///d:/nodemailer/database/schema.sql).

#### Option B: Local PostgreSQL Installation
If you are running PostgreSQL natively:
1. Create a database named `email_service`.
2. Connect to the database and execute the SQL statements inside [database/schema.sql](file:///d:/nodemailer/database/schema.sql).

---

### 2. Backend Server Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Verify that your `.env` settings align with your database port and password.
3. Start the Express development server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

> [!NOTE]
> If SMTP credentials (`SMTP_USER` and `SMTP_PASS`) are left blank in `.env`, the app automatically registers a test account on **Ethereal Mail** and logs visual email previews to the console on every trigger. If you are offline, it falls back to printing the HTML to your CLI.

---

### 3. Frontend App Setup
1. Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Run the Vite development server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Security Architectures

1.  **Hashed Data Storage**: User passwords are encrypted with `bcryptjs`. Short-lived OTP codes and reset tokens are hashed using SHA-256 before insertion into the database to block credential extraction in case of database leaks.
2.  **Anti-Replay / Reuse Protection**: Once an OTP or reset token is matched and verified, it is immediately deleted from the database.
3.  **Strict Token & Code Expirations**: OTPs are valid for **5 minutes**. Password reset links expire after **15 minutes**.
4.  **IP Rate Limiting**: The backend registers a customizable in-memory rate-limiting middleware blocking abuse on registrations/resends (max 5 actions per 15 mins) and login attempts (max 10 actions per 15 mins).

---

## 📡 API Endpoint Reference

### Authentication `/api/auth`
*   `POST /register` - Registers a user and sends signup verification OTP.
*   `POST /verify-email` - Verifies signup OTP, marks account verified, yields JWT token.
*   `POST /resend-verify-otp` - Resends verification OTP (rate limited).
*   `POST /login` - Checks password; sends login verification OTP to email.
*   `POST /verify-login-otp` - Verifies login OTP, logs user in, yields JWT token.
*   `POST /forgot-password` - Dispatches recovery reset link to user.
*   `POST /reset-password` - Receives reset token and modifies user password.

### Contact Us `/api/contact`
*   `POST /submit` - Transmits user messages to admin email (rate limited).

### User Action confirmation `/api/action` (Protected by JWT Bearer token)
*   `POST /confirm-action` - Sends custom formatted transaction receipts.
