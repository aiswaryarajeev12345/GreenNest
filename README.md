# GreenNest — Grow. Share. Connect.

Phase 1: Django + MySQL backend, JWT authentication, user roles/profiles,
and a React frontend with protected routes.

This phase implements only the foundation described in the Phase 1 spec —
no marketplace, community posts, AI features, weather, or payments yet.

## Project structure

```
GreenNest/
├── backend/     Django + DRF + Simple JWT
└── frontend/    React + Vite
```

## Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

1. Create a MySQL database named `greennest_db` (or your own name).
2. Copy `.env.example` to `.env` if you don't already have one, and fill in
   your real MySQL credentials and a fresh Django `SECRET_KEY`. The `.env`
   included in this project has local placeholder values only — replace
   them before running against your own MySQL server.
3. Run migrations and start the server:

```bash
python manage.py migrate
python manage.py createsuperuser   # optional, for Django admin access
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/v1/auth/`.

### Running backend tests

```bash
python manage.py test accounts
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and expects the backend at
`http://localhost:8000` (see `src/api/axios.js`).

Production build:

```bash
npm run build
```

## Phase 1 feature checklist

- [x] Register (Grower / Seller / Expert only — Admin is never public)
- [x] Login with JWT (access + refresh)
- [x] Token refresh
- [x] Protected profile view/update
- [x] Role-aware dashboard placeholders
- [x] Protected routes on the frontend
- [x] Logout

## Not in this phase

Community posts, likes/comments, marketplace, cart/orders, Razorpay,
AI disease detection, weather, garden tracking, events, notifications,
seed exchange — all planned for later phases.


## Clean local run

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver
```

The Phase 2 migration files are included in this package, so `makemigrations` is not required for a clean install.

### Frontend
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/`. The Django root `http://127.0.0.1:8000/` intentionally has no page; APIs are under `/api/v1/`.
