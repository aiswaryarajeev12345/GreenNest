from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ListingViewSet,
    create_request,
    my_requests,
    owner_request_action,
    owner_requests,
)


router = DefaultRouter()

router.register(
    "",
    ListingViewSet,
    basename="exchange",
)


urlpatterns = [
    path(
        "my-requests/",
        my_requests,
        name="my-exchange-requests",
    ),

    path(
        "owner-requests/",
        owner_requests,
        name="owner-exchange-requests",
    ),

    path(
        "requests/<int:pk>/action/",
        owner_request_action,
        name="exchange-request-action",
    ),

    path(
        "<int:pk>/request/",
        create_request,
        name="create-exchange-request",
    ),

    path(
        "",
        include(router.urls),
    ),
]