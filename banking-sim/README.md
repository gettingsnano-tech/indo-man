# Advanced Banking & Asset Management Platform

A high-fidelity fintech platform designed for institutional asset management and automated ledger control. It features manual deposit verification, multi-layer security, and an advanced administrative ecosystem.

**NOTE**: This system is architected for secure, audited financial workflows and institutional-grade oversight.

## Tech Stack

### Backend
- **Core**: Python 3.11+ / Flask
- **Database**: PostgreSQL (SQLAlchemy ORM) / SQLite (for local testing)
- **Migrations**: Flask-Migrate
- **Security**: Flask-JWT-Extended, bcrypt hashing
- **Validation**: Marshmallow Schemas
- **Production Server**: Gunicorn

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
- **ATM Cards**: Apply for physical/virtual ATM cards with specific limits and card networks.
- **Compliance**: Full KYC submission and status tracking.
- **Support & Ticketing**: Secure contact form and support ticketing system for resolving account issues.

### Admin Panel
- **User Management**: Control account activity, manual email verification, transfer rights, and custom fees.
- **Financial Control**: Review, approve, or reject deposit and withdrawal requests with custom memos.
- **Identity Review**: Process KYC submissions and ATM Card applications.
- **Dynamic Branding**: Configure the platform's visual identity (bank logo and name) in real-time without redeploying.
- **Global Config**: Modify bank instructions, deposit thresholds, and system-wide fees.

---

## Local Development Setup

### 1. Prerequisites
- Node.js & npm
- Python 3.11+
- PostgreSQL database (or SQLite fallback)

### 2. Backend Setup
1. Enter the backend directory: `cd backend`
2. Create a virtual environment and activate it: `python -m venv venv` and `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Configure environment: Create `.env` from `.env.example` and update `DATABASE_URL`.
5. Initialize Database:
   ```bash
   flask db upgrade
   ```
   *(Note: Migrations are already included in the `migrations` folder. Just run upgrade to apply them.)*
6. Seed initial data: `python seed.py`
7. Run the development server: `python run.py` (Runs on `http://127.0.0.1:5000`)

### 3. Frontend Setup
1. Enter the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Configure environment: Create a `.env` file and set `VITE_API_URL=http://127.0.0.1:5000/api`
4. Start the dev server: `npm run dev`

---

## Deployment (Railway)

This project is structured as a monorepo and is fully configured to be deployed on Railway.

### 1. Push to GitHub
Commit and push your repository to GitHub.

### 2. Configure Database
- Create a New Project in Railway.
- Select **Provision PostgreSQL**. Railway will automatically generate a `DATABASE_URL`.

### 3. Deploy Backend
- In the same project, click **New** -> **GitHub Repo** and select your repository.
- Go to the newly created service's **Settings** and set the **Root Directory** to `/backend`.
- Railway will automatically detect the Python environment and use the `Procfile` and `gunicorn` to start the app.
- Go to the **Variables** tab and add:
  - `SECRET_KEY`: `your_random_secret_string`
  - `JWT_SECRET_KEY`: `your_random_jwt_secret`
  - `FRONTEND_URL`: `https://your-frontend-domain.up.railway.app` (You can add this after deploying the frontend)
- Under **Settings** -> **Networking**, generate a domain (e.g., `banking-backend.up.railway.app`).

### 4. Deploy Frontend
- Click **New** -> **GitHub Repo** and select your repository again to create the second service.
- Go to **Settings** and set the **Root Directory** to `/frontend`.
- Railway will detect Vite and run `npm run build` to serve the static site automatically.
- Go to the **Variables** tab and add:
  - `VITE_API_URL`: `https://your-backend-domain.up.railway.app/api`
- Under **Settings** -> **Networking**, generate a domain. 

*Note: You may need to trigger a redeploy for the frontend after setting `VITE_API_URL` since Vite bundles it at build time.*

---

## Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@bank.com` | `Admin1234` |
| **Demo User** | `alice@demo.com` | `User1234` |
| **Demo User** | `bob@demo.com` | `User1234` |
