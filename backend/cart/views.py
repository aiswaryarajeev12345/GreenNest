from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


def get_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def cart(request):
    return Response(
        CartSerializer(
            get_cart(request.user)
        ).data
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add(request):
    product = get_object_or_404(
        Product,
        pk=request.data.get("product")
    )

    try:
        quantity = int(
            request.data.get("quantity", 1)
        )
    except (TypeError, ValueError):
        return Response(
            {
                "detail": "Quantity must be a whole number."
            },
            status=400
        )

    # Stock controls availability.
    if product.quantity <= 0:
        return Response(
            {
                "detail": "This product is sold out."
            },
            status=400
        )

    if quantity < 1:
        return Response(
            {
                "detail": "Quantity must be at least 1."
            },
            status=400
        )

    if quantity > product.quantity:
        return Response(
            {
                "detail": "Not enough stock available."
            },
            status=400
        )

    cart_obj = get_cart(request.user)

    item, created = CartItem.objects.get_or_create(
        cart=cart_obj,
        product=product,
        defaults={
            "quantity": quantity
        }
    )

    if not created:
        new_quantity = item.quantity + quantity

        if new_quantity > product.quantity:
            return Response(
                {
                    "detail": "Not enough stock available."
                },
                status=400
            )

        item.quantity = new_quantity
        item.save()

    return Response(
        CartSerializer(cart_obj).data,
        status=201
    )


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def item(request, pk):
    cart_item = get_object_or_404(
        CartItem,
        pk=pk,
        cart__user=request.user
    )

    if request.method == "DELETE":
        cart_item.delete()

        return Response(
            status=204
        )

    try:
        quantity = int(
            request.data.get("quantity", 0)
        )
    except (TypeError, ValueError):
        return Response(
            {
                "detail": "Quantity must be a whole number."
            },
            status=400
        )

    if quantity < 1:
        return Response(
            {
                "detail": "Quantity must be at least 1."
            },
            status=400
        )

    if quantity > cart_item.product.quantity:
        return Response(
            {
                "detail": "Not enough stock available."
            },
            status=400
        )

    cart_item.quantity = quantity
    cart_item.save()

    return Response(
        CartSerializer(
            cart_item.cart
        ).data
    )