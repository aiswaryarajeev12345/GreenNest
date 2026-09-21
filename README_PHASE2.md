# GreenNest Phase 2
Phase 2 adds community, marketplace, exchange, expert classes, cart, orders, Razorpay-ready checkout and seller studio.

## Backend
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py test
python manage.py runserver

## Frontend
cd frontend
npm install
npm run dev

React runs on http://localhost:5173 and Django on http://localhost:8000.

## Razorpay
Add real values only to backend/.env:
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
Never put the secret in frontend.

## Images
The redesigned home uses remote Unsplash photography as visual placeholders. Product/community/exchange/class photos are uploaded through the UI.
