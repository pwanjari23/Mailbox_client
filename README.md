# Mailbox Client

A fullstack mailbox client application built with:
- **Frontend**: React, React Bootstrap, Bootstrap Icons, Vite.
- **Backend**: Node.js, Express, MySQL, Sequelize ORM.

## Setup Instructions

### 1. Database Setup
Ensure that you have MySQL running locally. 
- Open [backend/.env](file:///c:/Users/Dell/OneDrive/Documents/sharpner/MailBox-Client/backend/.env) and configure your database host, port, user, and password:
  ```env
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASS=your_mysql_password
  DB_NAME=mailbox_db
  ```
- The backend server will automatically check if the database `mailbox_db` exists and create it, followed by synchronizing the Sequelize models.

### 2. Install & Start Backend
From the root directory:
```bash
cd backend
npm install
npm start # runs node server.js
# or
npm run dev # runs nodemon
```
The server will start on port `5000`.

### 3. Install & Start Frontend
From the root directory:
```bash
cd frontend
npm install
npm run dev
```
The client will start on `http://localhost:5173/`.

## Features
- Centered, glassmorphic responsive signup screen layout.
- Mandatory field verification (submit is disabled until basic validations pass).
- Confirm password matching checks.
- Password visibility toggles.
- Logs success response to browser console upon registration.
