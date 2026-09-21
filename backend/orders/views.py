from decimal import Decimal

from django.db import transaction

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from cart.models import Cart
from marketplace.models import Product

from .models import Order, OrderItem
from .serializers import OrderSerializer




def cart_total(cart):
    return sum(
        (
            item.product.price * item.quantity
            for item in cart.items.select_related("product").all()
        ),
        Decimal("0"),
    )




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    cart = (
        Cart.objects
        .filter(user=request.user)
        .first()
    )

    if not cart:
        return Response(
            {
                "detail": "Your garden basket is empty."
            },
            status=400,
        )

    items = list(
        cart.items
        .select_related(
            "product",
            "product__seller",
        )
        .all()
    )

    if not items:
        return Response(
            {
                "detail": "Your garden basket is empty."
            },
            status=400,
        )

    required = [
        "delivery_name",
        "delivery_phone",
        "delivery_address",
        "delivery_city",
        "delivery_district",
        "delivery_state",
        "delivery_pincode",
    ]

    missing = [
        field
        for field in required
        if not str(
            request.data.get(field, "")
        ).strip()
    ]

    if missing:
        return Response(
            {
                "detail": "Please complete delivery information.",
                "fields": missing,
            },
            status=400,
        )

    with transaction.atomic():

        # Lock products while checking stock.
        product_ids = [
            item.product_id
            for item in items
        ]

        locked_products = {
            product.id: product
            for product in (
                Product.objects
                .select_for_update()
                .filter(id__in=product_ids)
            )
        }

        # Make sure every product still exists.
        if len(locked_products) != len(
            set(product_ids)
        ):
            return Response(
                {
                    "detail": (
                        "One or more products are "
                        "no longer available."
                    )
                },
                status=400,
            )

        # Check stock and availability.
        for item in items:
            product = locked_products[
                item.product_id
            ]

            if item.quantity <= 0:
                return Response(
                    {
                        "detail": (
                            f"Invalid quantity for "
                            f"{product.name}."
                        )
                    },
                    status=400,
                )

            if not product.is_available:
                return Response(
                    {
                        "detail": (
                            f"{product.name} is "
                            f"no longer available."
                        )
                    },
                    status=400,
                )

            if item.quantity > product.quantity:
                return Response(
                    {
                        "detail": (
                            f"{product.name} is no longer "
                            f"available in that quantity."
                        )
                    },
                    status=400,
                )

        
        total = sum(
            (
                locked_products[
                    item.product_id
                ].price * item.quantity
                for item in items
            ),
            Decimal("0"),
        )

        # Create the order.
        order = Order.objects.create(
            user=request.user,
            total_amount=total,
            **{
                field: request.data[field]
                for field in required
            },
        )

        # Create order items and reduce stock.
        for item in items:
            product = locked_products[
                item.product_id
            ]

            subtotal = (
                product.price * item.quantity
            )

            OrderItem.objects.create(
                order=order,
                product=product,
                seller=product.seller,
                quantity=item.quantity,
                price=product.price,
                subtotal=subtotal,
            )

            # Reduce stock.
            product.quantity = (
                product.quantity - item.quantity
            )

            if product.quantity < 0:
                product.quantity = 0

            # Product becomes unavailable when stock reaches zero.
            product.is_available = (
                product.quantity > 0
            )

            product.save(
                update_fields=[
                    "quantity",
                    "is_available",
                    "updated_at",
                ]
            )

        # Empty the basket only after successful order creation.
        cart.items.all().delete()

    return Response(
        OrderSerializer(order).data,
        status=201,
    )




@api_view(["GET"])
@permission_classes([IsAuthenticated])
def orders(request):
    user_orders = (
        Order.objects
        .filter(
            user=request.user
        )
        .prefetch_related(
            "items__product",
            "items__seller",
        )
        .order_by("-created_at")
    )

    return Response(
        OrderSerializer(
            user_orders,
            many=True,
        ).data
    )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def detail(request, pk):
    try:
        order = (
            Order.objects
            .prefetch_related(
                "items__product",
                "items__seller",
            )
            .get(
                pk=pk,
                user=request.user,
            )
        )

    except Order.DoesNotExist:
        return Response(
            {
                "detail": "Order not found."
            },
            status=404,
        )

    return Response(
        OrderSerializer(order).data
    )




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    Prepare a demo payment.

    IMPORTANT:
    This is NOT a real payment.

    No:
    - Razorpay transaction
    - bank transaction
    - card transaction
    - real money

    is processed.
    """

    order_id = request.data.get(
        "order_id"
    )

    if not order_id:
        return Response(
            {
                "detail": "Order ID is required."
            },
            status=400,
        )

    try:
        order = (
            Order.objects
            .filter(
                pk=order_id,
                user=request.user,
            )
            .first()
        )

    except (TypeError, ValueError):
        order = None

    if not order:
        return Response(
            {
                "detail": "Order not found."
            },
            status=404,
        )

  
    if order.payment_status == "PAID":
        return Response(
            {
                "success": True,
                "demo": True,
                "already_paid": True,
                "order_id": order.id,
                "amount": str(
                    order.total_amount
                ),
                "currency": "INR",
                "message": "Order is already paid.",
            },
            status=200,
        )

  
    if order.status == "CANCELLED":
        return Response(
            {
                "detail": (
                    "Cancelled orders cannot be paid."
                )
            },
            status=400,
        )

    return Response(
        {
            "success": True,
            "demo": True,
            "already_paid": False,
            "order_id": order.id,
            "amount": str(
                order.total_amount
            ),
            "currency": "INR",
            "message": "Demo payment is ready.",
        },
        status=200,
    )




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    Complete the demo payment.

    IMPORTANT:
    This does NOT process real money.

    It simply changes:

        payment_status -> PAID

    and:

        PENDING -> CONFIRMED
    """

    order_id = request.data.get(
        "order_id"
    )

    if not order_id:
        return Response(
            {
                "detail": "Order ID is required."
            },
            status=400,
        )

    # IMPORTANT:
    # select_for_update() must be inside transaction.atomic().
    with transaction.atomic():

        try:
            order = (
                Order.objects
                .select_for_update()
                .filter(
                    pk=order_id,
                    user=request.user,
                )
                .first()
            )

        except (TypeError, ValueError):
            order = None

        if not order:
            return Response(
                {
                    "detail": "Order not found."
                },
                status=404,
            )

        # Already paid is not an error.
        if order.payment_status == "PAID":
            return Response(
                {
                    "success": True,
                    "demo": True,
                    "already_paid": True,
                    "message": (
                        "Order is already paid."
                    ),
                    "order": OrderSerializer(
                        order
                    ).data,
                },
                status=200,
            )

        # Cancelled orders cannot be paid.
        if order.status == "CANCELLED":
            return Response(
                {
                    "detail": (
                        "Cancelled orders cannot be paid."
                    )
                },
                status=400,
            )

        # Complete demo payment.
        order.payment_status = "PAID"

        # Payment confirms a pending order.
        if order.status == "PENDING":
            order.status = "CONFIRMED"

        order.save(
            update_fields=[
                "payment_status",
                "status",
                "updated_at",
            ]
        )

    return Response(
        {
            "success": True,
            "demo": True,
            "already_paid": False,
            "message": "Demo payment successful.",
            "order": OrderSerializer(
                order
            ).data,
        },
        status=200,
    )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def seller_dashboard(request):
    queryset = OrderItem.objects.filter(
        seller=request.user
    )

    total = sum(
        (
            item.subtotal
            for item in queryset
        ),
        Decimal("0"),
    )

    order_ids = queryset.values_list(
        "order_id",
        flat=True,
    )

    unique_order_ids = set(
        order_ids
    )

    return Response(
        {
            "total_products": (
                request.user.products.count()
            ),

            "total_orders": (
                len(unique_order_ids)
            ),

            "pending_orders": (
                Order.objects.filter(
                    id__in=unique_order_ids,
                    status__in=[
                        "PENDING",
                        "CONFIRMED",
                        "PROCESSING",
                    ],
                ).count()
            ),

            "completed_orders": (
                Order.objects.filter(
                    id__in=unique_order_ids,
                    status="DELIVERED",
                ).count()
            ),

            "total_sales": total,
        }
    )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def seller_orders(request):
    queryset = (
        Order.objects
        .filter(
            items__seller=request.user
        )
        .distinct()
        .prefetch_related(
            "items__product",
            "items__seller",
        )
        .order_by("-created_at")
    )

    return Response(
        OrderSerializer(
            queryset,
            many=True,
        ).data
    )




@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def seller_update_status(request, pk):

    try:
        order = (
            Order.objects
            .filter(
                pk=pk,
                items__seller=request.user,
            )
            .distinct()
            .get()
        )

    except Order.DoesNotExist:
        return Response(
            {
                "detail": "Order not found."
            },
            status=404,
        )

    current_status = order.status

    new_status = request.data.get(
        "status"
    )

    if not new_status:
        return Response(
            {
                "detail": (
                    "New order status is required."
                )
            },
            status=400,
        )

    # Allowed status transitions.
    allowed_transitions = {
        "PENDING": [
            "CONFIRMED",
            "CANCELLED",
        ],

        "CONFIRMED": [
            "PROCESSING",
            "CANCELLED",
        ],

        "PROCESSING": [
            "SHIPPED",
        ],

        "SHIPPED": [
            "DELIVERED",
        ],

        "DELIVERED": [],

        "CANCELLED": [],
    }

    # Make sure status exists.
    if new_status not in dict(
        Order.STATUSES
    ):
        return Response(
            {
                "detail": "Invalid order status."
            },
            status=400,
        )

    # Make sure transition is allowed.
    if new_status not in allowed_transitions.get(
        current_status,
        [],
    ):
        return Response(
            {
                "detail": (
                    f"Order cannot move from "
                    f"{current_status} to "
                    f"{new_status}."
                )
            },
            status=400,
        )

    order.status = new_status

    order.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return Response(
        OrderSerializer(order).data
    )