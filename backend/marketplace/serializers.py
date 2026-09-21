from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):

    seller_name = serializers.CharField(
        source="seller.username",
        read_only=True,
    )

    class Meta:
        model = Product

        fields = [
            "id",
            "seller",
            "seller_name",
            "name",
            "description",
            "category",
            "price",
            "quantity",
            "unit",
            "image",
            "location",
            "is_available",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "seller",
            "seller_name",
            "is_available",
            "created_at",
            "updated_at",
        ]

    def validate_price(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )

        return value

    def validate_quantity(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than zero."
            )

        return value