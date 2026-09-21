import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv
BASE_DIR=Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR/".env")
SECRET_KEY=os.getenv("SECRET_KEY","unsafe-fallback-key-do-not-use-in-production")
DEBUG=os.getenv("DEBUG","True")=="True"
ALLOWED_HOSTS=[x.strip() for x in os.getenv("ALLOWED_HOSTS","localhost,127.0.0.1").split(",") if x.strip()]
INSTALLED_APPS=[
"django.contrib.admin","django.contrib.auth","django.contrib.contenttypes","django.contrib.sessions","django.contrib.messages","django.contrib.staticfiles",
"rest_framework","rest_framework_simplejwt","corsheaders",
"accounts.apps.AccountsConfig","community","marketplace","exchange","classes","cart","orders",
]
MIDDLEWARE=["django.middleware.security.SecurityMiddleware","corsheaders.middleware.CorsMiddleware","django.contrib.sessions.middleware.SessionMiddleware","django.middleware.common.CommonMiddleware","django.middleware.csrf.CsrfViewMiddleware","django.contrib.auth.middleware.AuthenticationMiddleware","django.contrib.messages.middleware.MessageMiddleware","django.middleware.clickjacking.XFrameOptionsMiddleware"]
ROOT_URLCONF="greennest.urls"
TEMPLATES=[{"BACKEND":"django.template.backends.django.DjangoTemplates","DIRS":[],"APP_DIRS":True,"OPTIONS":{"context_processors":["django.template.context_processors.debug","django.template.context_processors.request","django.contrib.auth.context_processors.auth","django.contrib.messages.context_processors.messages"]}}]
WSGI_APPLICATION="greennest.wsgi.application"
DATABASES={"default":{"ENGINE":"django.db.backends.mysql","NAME":os.getenv("DB_NAME","greennest_db"),"USER":os.getenv("DB_USER","root"),"PASSWORD":os.getenv("DB_PASSWORD",""),"HOST":os.getenv("DB_HOST","localhost"),"PORT":os.getenv("DB_PORT","3306"),"OPTIONS":{"charset":"utf8mb4"}}}
AUTH_PASSWORD_VALIDATORS=[{"NAME":"django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},{"NAME":"django.contrib.auth.password_validation.MinimumLengthValidator","OPTIONS":{"min_length":8}},{"NAME":"django.contrib.auth.password_validation.CommonPasswordValidator"},{"NAME":"django.contrib.auth.password_validation.NumericPasswordValidator"}]
LANGUAGE_CODE="en-us"; TIME_ZONE="Asia/Kolkata"; USE_I18N=True; USE_TZ=True
STATIC_URL="static/"; STATIC_ROOT=BASE_DIR/"staticfiles"; MEDIA_URL="media/"; MEDIA_ROOT=BASE_DIR/"media"; DEFAULT_AUTO_FIELD="django.db.models.BigAutoField"
REST_FRAMEWORK={"DEFAULT_AUTHENTICATION_CLASSES":("rest_framework_simplejwt.authentication.JWTAuthentication",),"DEFAULT_PERMISSION_CLASSES":("rest_framework.permissions.IsAuthenticated",)}
SIMPLE_JWT={"ACCESS_TOKEN_LIFETIME":timedelta(minutes=30),"REFRESH_TOKEN_LIFETIME":timedelta(days=7),"ROTATE_REFRESH_TOKENS":True,"BLACKLIST_AFTER_ROTATION":False,"AUTH_HEADER_TYPES":("Bearer",)}
CORS_ALLOWED_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"] if DEBUG else [x.strip() for x in os.getenv("CORS_ALLOWED_ORIGINS","").split(",") if x.strip()]
CORS_ALLOW_CREDENTIALS=True
RAZORPAY_KEY_ID=os.getenv("RAZORPAY_KEY_ID","")
RAZORPAY_KEY_SECRET=os.getenv("RAZORPAY_KEY_SECRET","")
