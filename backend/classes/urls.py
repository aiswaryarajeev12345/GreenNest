from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ClassViewSet,
    enrollment,
    my_classes,
)


router = DefaultRouter()

router.register(
    "",
    ClassViewSet,
    basename="class",
)


urlpatterns = [
    path(
        "my/",
        my_classes,
        name="my-classes",
    ),

    path(
        "<int:pk>/join/",
        enrollment,
        name="class-enrollment",
    ),

    path(
        "",
        include(router.urls),
    ),
]