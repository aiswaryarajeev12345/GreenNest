from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from accounts.models import Profile
class MarketplaceTests(APITestCase):
 def setUp(self):
  self.u=User.objects.create_user(username="grower",password="StrongPass123"); self.u.profile.role="GROWER"; self.u.profile.save(); self.client.force_authenticate(self.u)
 def test_grower_can_create_product(self):
  r=self.client.post("/api/v1/marketplace/products/",{"name":"Tomatoes","description":"Fresh","category":"Vegetables","price":"50","quantity":10,"unit":"kg","location":"Local"})
  self.assertEqual(r.status_code,201)
