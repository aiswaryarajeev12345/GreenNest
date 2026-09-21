from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include,path
urlpatterns=[
 path("admin/",admin.site.urls),
 path("api/v1/auth/",include("accounts.urls")),
 path("api/v1/community/",include("community.urls")),
 path("api/v1/marketplace/",include("marketplace.urls")),
 path("api/v1/exchange/",include("exchange.urls")),
 path("api/v1/classes/",include("classes.urls")),
 path("api/v1/cart/",include("cart.urls")),
 path("api/v1/orders/",include("orders.urls")),
]
if settings.DEBUG: urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
