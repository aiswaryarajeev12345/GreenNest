from django.conf import settings
from django.db import models
class ExchangeListing(models.Model):
 CATEGORIES=[(x,x) for x in ["Seeds","Plants","Fertilizers","Gardening Materials","Garden Tools","Other"]]
 STATUS=[("AVAILABLE","Available"),("PENDING","Pending"),("ACCEPTED","Accepted"),("COMPLETED","Completed"),("CANCELLED","Cancelled")]
 owner=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="exchange_listings")
 title=models.CharField(max_length=180); description=models.TextField(); category=models.CharField(max_length=40,choices=CATEGORIES)
 image=models.ImageField(upload_to="exchange/",blank=True,null=True); location=models.CharField(max_length=150,blank=True)
 status=models.CharField(max_length=12,choices=STATUS,default="AVAILABLE"); created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
class ExchangeRequest(models.Model):
 STATUS=[("PENDING","Pending"),("ACCEPTED","Accepted"),("REJECTED","Rejected"),("CANCELLED","Cancelled"),("COMPLETED","Completed")]
 listing=models.ForeignKey(ExchangeListing,on_delete=models.CASCADE,related_name="requests")
 requester=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="exchange_requests")
 message=models.TextField(blank=True); offered_item=models.CharField(max_length=180)
 status=models.CharField(max_length=10,choices=STATUS,default="PENDING"); created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
