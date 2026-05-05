# Banking Simulation Platform

A high-fidelity fintech simulation platform designed for educational and demonstration purposes. It mimics a full banking lifecycle including manual deposit verification, automated ledger management, and administrative control.

**DISCLAIMER**: This is a SIMULATION. It handles NO real financial transactions, NO real money, and has NO payment gateway integrations.

## Tech Stack

### Backend
- **Core**: Python 3.11+ / Flask
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Migrations**: Flask-Migrate
- **Security**: Flask-JWT-Extended, bcrypt hashing
- **Validation**: Marshmallow Schemas

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Design System**: Custom Premium Dark Fintech Theme

---

## Features

### Client Portal
- **Dashboard**: Live balance tracking and transaction history summaries.
- **Manual Deposits**: Request deposits by submitting proof of transfer based on bank instructions.
- **Withdrawals**: Rule-based withdrawals with dynamic fee snapshots and admin approval flows.
- **P2P Transfers**: Instant internal transfers (Admin-enabled per user).
- **Compliance**: Full KYC submission and status tracking.

### Admin Panel
- **User Management**: Control account activity, transfer rights, and custom fees.
- **Financial Control**: Review, approve, or reject deposit and withdrawal requests with custom memos.
- **Identity Review**: Process KYC submissions.
- **Global Config**: Modify bank instructions, deposit thresholds, and system-wide fees.

---

## Getting Started

### 1. Prerequisites
- Node.js & npm
- Python 3.11+
- PostgreSQL database

### 2. Backend Setup
1. Enter the backend directory: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Configure environment: Create `.env` from `.env.example` and update `DATABASE_URL`.
4. Initialize Database:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```
5. Seed initial data: `python seed.py`
6. Run the server: `python run.py`

### 3. Frontend Setup
1. Enter the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

---

## Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@bank.com` | `Admin1234` |
| **Demo User** | `alice@demo.com` | `User1234` |
| **Demo User** | `bob@demo.com` | `User1234` |
