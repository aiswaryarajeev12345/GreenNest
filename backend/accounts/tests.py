from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Profile


class AuthFlowTests(APITestCase):
    def _register(self, **overrides):
        payload = {
            "username": "grower1",
            "email": "grower1@example.com",
            "phone": "9999999999",
            "password": "StrongPass123",
            "confirm_password": "StrongPass123",
            "role": "GROWER",
        }
        payload.update(overrides)
        return self.client.post("/api/v1/auth/register/", payload)

    def test_grower_registration(self):
        resp = self._register(username="grower1", role="GROWER")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Profile.objects.get(user__username="grower1").role, "GROWER")

    def test_seller_registration(self):
        resp = self._register(username="seller1", email="seller1@example.com", role="SELLER")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Profile.objects.get(user__username="seller1").role, "SELLER")

    def test_expert_registration(self):
        resp = self._register(username="expert1", email="expert1@example.com", role="EXPERT")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Profile.objects.get(user__username="expert1").role, "EXPERT")

    def test_admin_public_registration_is_rejected(self):
        resp = self._register(username="wannabe_admin", email="wa@example.com", role="ADMIN")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="wannabe_admin").exists())

    def test_duplicate_username_rejected(self):
        self._register(username="dupe", email="dupe1@example.com")
        resp = self._register(username="dupe", email="dupe2@example.com")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_mismatch_rejected(self):
        resp = self._register(
            username="mismatch",
            email="mismatch@example.com",
            confirm_password="Different123",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_and_role_identification(self):
        self._register(username="loginuser", email="loginuser@example.com", role="SELLER")
        resp = self.client.post(
            "/api/v1/auth/login/", {"username": "loginuser", "password": "StrongPass123"}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)
        self.assertEqual(resp.data["user"]["profile"]["role"], "SELLER")

    def test_token_refresh(self):
        self._register(username="refreshuser", email="refreshuser@example.com")
        login = self.client.post(
            "/api/v1/auth/login/", {"username": "refreshuser", "password": "StrongPass123"}
        )
        refresh_token = login.data["refresh"]
        resp = self.client.post("/api/v1/auth/token/refresh/", {"refresh": refresh_token})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)

    def test_protected_profile_requires_auth(self):
        resp = self.client.get("/api/v1/auth/profile/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_profile_get_and_update(self):
        self._register(username="profileuser", email="profileuser@example.com")
        login = self.client.post(
            "/api/v1/auth/login/", {"username": "profileuser", "password": "StrongPass123"}
        )
        access = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        get_resp = self.client.get("/api/v1/auth/profile/")
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(get_resp.data["username"], "profileuser")

        put_resp = self.client.put(
            "/api/v1/auth/profile/",
            {"bio": "I grow tomatoes on my terrace.", "location": "Thrissur"},
            format="multipart",
        )
        self.assertEqual(put_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(put_resp.data["profile"]["bio"], "I grow tomatoes on my terrace.")

    def test_unauthorized_access_with_bad_token_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")
        resp = self.client.get("/api/v1/auth/profile/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_superuser_gets_admin_profile_automatically(self):
        admin_user = User.objects.create_superuser(
            username="siteadmin", email="admin@example.com", password="AdminPass123"
        )
        self.assertEqual(admin_user.profile.role, "ADMIN")
