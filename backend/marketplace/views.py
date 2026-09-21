from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response

from accounts.models import Profile

from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(ModelViewSet):

    queryset = Product.objects.select_related(
        "seller",
        "seller__profile",
    )

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        qs = super().get_queryset()

        category = self.request.query_params.get(
            "category"
        )

        search = self.request.query_params.get(
            "search"
        )

        if category and category != "All":

            qs = qs.filter(
                category=category
            )

        if search:

            qs = qs.filter(
                name__icontains=search
            )

        return qs

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        role = getattr(
            getattr(
                request.user,
                "profile",
                None,
            ),
            "role",
            None,
        )

        if role not in [
            Profile.Role.GROWER,
            Profile.Role.SELLER,
        ]:

            return Response(
                {
                    "detail": (
                        "Only growers and sellers "
                        "can list marketplace products."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(
            request,
            *args,
            **kwargs,
        )

    def perform_create(
        self,
        serializer
    ):

        serializer.save(
            seller=self.request.user,
            is_available=True,
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        product = self.get_object()

        if product.seller_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "You can only edit "
                        "your own products."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(
            request,
            *args,
            **kwargs,
        )

    def partial_update(
        self,
        request,
        *args,
        **kwargs
    ):

        product = self.get_object()

        if product.seller_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "You can only edit "
                        "your own products."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().partial_update(
            request,
            *args,
            **kwargs,
        )

    def perform_update(
        self,
        serializer
    ):

        product = serializer.instance

        updated_product = serializer.save()

        updated_product.is_available = (
            updated_product.quantity > 0
        )

        updated_product.save(
            update_fields=[
                "is_available",
                "updated_at",
            ]
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        product = self.get_object()

        if product.seller_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "You can only delete "
                        "your own products."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(
            request,
            *args,
            **kwargs,
        )