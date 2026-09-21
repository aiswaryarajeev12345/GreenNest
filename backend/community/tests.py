from django.contrib.auth.models import User
from rest_framework.test import APITestCase
class CommunityTests(APITestCase):
 def setUp(self):
  self.u=User.objects.create_user(username="grower",password="StrongPass123"); self.client.force_authenticate(self.u)
 def test_create_post(self):
  r=self.client.post("/api/v1/community/posts/",{"title":"Tomatoes","content":"Growing well","category":"Gardening Tips"})
  self.assertEqual(r.status_code,201)
 def test_posts_require_auth(self):
  self.client.force_authenticate(None); self.assertEqual(self.client.get("/api/v1/community/posts/").status_code,401)
