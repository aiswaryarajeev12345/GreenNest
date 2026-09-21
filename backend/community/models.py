from django.conf import settings
from django.db import models
class Post(models.Model):
    CATEGORIES=[(x,x) for x in ["Terrace Farming","Vegetables","Flowers","Organic Gardening","Gardening Tips","Harvest","Beginners","Other"]]
    author=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="garden_posts")
    title=models.CharField(max_length=180); content=models.TextField()
    image=models.ImageField(upload_to="community/",blank=True,null=True)
    category=models.CharField(max_length=40,choices=CATEGORIES,default="Other")
    created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["-created_at"]
class PostLike(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    post=models.ForeignKey(Post,on_delete=models.CASCADE,related_name="likes")
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta: constraints=[models.UniqueConstraint(fields=["user","post"],name="unique_post_like")]
class Comment(models.Model):
    post=models.ForeignKey(Post,on_delete=models.CASCADE,related_name="comments")
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    content=models.TextField(max_length=1000)
    created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["created_at"]
