from rest_framework import serializers
from .models import Post,PostLike,Comment
class MiniUser(serializers.Serializer):
 username=serializers.CharField(); location=serializers.CharField()
class PostSerializer(serializers.ModelSerializer):
 author_name=serializers.CharField(source="author.username",read_only=True)
 location=serializers.CharField(source="author.profile.location",read_only=True)
 like_count=serializers.SerializerMethodField()
 comment_count=serializers.SerializerMethodField()
 liked_by_current_user=serializers.SerializerMethodField()
 class Meta:
  model=Post; fields="id author author_name location title content image category created_at updated_at like_count comment_count liked_by_current_user".split()
  read_only_fields=["author"]
 def get_like_count(self,obj): return obj.likes.count()
 def get_comment_count(self,obj): return obj.comments.count()
 def get_liked_by_current_user(self,obj):
  u=self.context["request"].user
  return u.is_authenticated and obj.likes.filter(user=u).exists()
class CommentSerializer(serializers.ModelSerializer):
 user_name=serializers.CharField(source="user.username",read_only=True)
 class Meta:
  model=Comment; fields=["id","post","user","user_name","content","created_at","updated_at"]; read_only_fields=["post","user"]
