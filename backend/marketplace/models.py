from django.conf import settings
from django.db import models


class Product(models.Model):
    CATEGORIES = [
        (x, x)
        for x in [
            "Vegetables",
            "Fruits",
            "Herbs",
            "Seeds",
            "Plants",
            "Gardening Materials",
            "Garden Kits",
            "Other",
        ]
    ]

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="products",
    )

    name = models.CharField(max_length=180)
    description = models.TextField()

    category = models.CharField(
        max_length=40,
        choices=CATEGORIES,
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    quantity = models.PositiveIntegerField()

    unit = models.CharField(
        max_length=30,
        default="item",
    )

    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
    )

    location = models.CharField(
        max_length=150,
        blank=True,
    )

    is_available = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        # Availability is automatically controlled by stock.
        self.is_available = self.quantity > 0

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
