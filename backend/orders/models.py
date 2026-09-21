from django.conf import settings
from django.db import models

from marketplace.models import Product


class Order(models.Model):

    STATUSES = [
        (x, x.title())
        for x in [
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ]
    ]

    PAYMENTS = [
        (x, x.title())
        for x in [
            "PENDING",
            "PAID",
            "FAILED",
            "REFUNDED",
        ]
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=12,
        choices=STATUSES,
        default="PENDING",
    )

    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENTS,
        default="PENDING",
    )

    razorpay_order_id = models.CharField(
        max_length=100,
        blank=True,
    )

    delivery_name = models.CharField(
        max_length=150,
    )

    delivery_phone = models.CharField(
        max_length=30,
    )

    delivery_address = models.TextField()

    delivery_city = models.CharField(
        max_length=100,
    )

    delivery_district = models.CharField(
        max_length=100,
    )

    delivery_state = models.CharField(
        max_length=100,
    )

    delivery_pincode = models.CharField(
        max_length=20,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        related_name="order_items",
    )

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sold_order_items",
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )