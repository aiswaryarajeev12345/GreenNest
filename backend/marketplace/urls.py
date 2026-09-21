from django.urls import include,path
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet
r=DefaultRouter(); r.register("products",ProductViewSet,basename="product")
urlpatterns=[path("",include(r.urls))]
