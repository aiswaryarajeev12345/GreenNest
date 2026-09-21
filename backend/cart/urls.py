from django.urls import path
from .views import cart,add,item
urlpatterns=[path("",cart),path("items/",add),path("items/<int:pk>/",item)]
