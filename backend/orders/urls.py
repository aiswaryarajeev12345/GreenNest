from django.urls import path
from .views import create_order,orders,detail,create_payment,verify_payment,seller_dashboard,seller_orders,seller_update_status
urlpatterns=[path("",orders),path("create/",create_order),path("create-payment/",create_payment),path("verify-payment/",verify_payment),path("seller/dashboard/",seller_dashboard),path("seller/",seller_orders),path("seller/<int:pk>/status/",seller_update_status),path("<int:pk>/",detail)]
