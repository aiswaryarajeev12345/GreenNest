from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    ProfileView,
    RegisterView,
    admin_statistics,
    admin_activity,
)


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    path(
        "admin/statistics/",
        admin_statistics,
        name="admin-statistics",
    ),

    path(
        "admin/activity/",
        admin_activity,
        name="admin-activity",
    ),
]