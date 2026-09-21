from django.urls import include,path
from rest_framework.routers import DefaultRouter
from .views import PostViewSet,like_post,comments,comment_detail
r=DefaultRouter(); r.register("posts",PostViewSet,basename="post")
urlpatterns=[path("",include(r.urls)),path("posts/<int:pk>/like/",like_post),path("posts/<int:pk>/comments/",comments),path("comments/<int:pk>/",comment_detail)]
