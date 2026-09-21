from django.contrib.auth.models import User
from rest_framework.test import APITestCase
class ClassTests(APITestCase):
 def test_non_expert_cannot_create(self):
  u=User.objects.create_user(username="grower",password="StrongPass123"); self.client.force_authenticate(u)
  r=self.client.post("/api/v1/classes/",{"title":"Class","description":"x","category":"Other","date":"2030-01-01","start_time":"10:00","duration":60,"mode":"ONLINE","price":"0","max_seats":10})
  self.assertEqual(r.status_code,403)
