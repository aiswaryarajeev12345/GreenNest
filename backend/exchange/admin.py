from django.contrib import admin
from .models import ExchangeListing,ExchangeRequest

admin.site.register(ExchangeListing)
admin.site.register(ExchangeRequest)