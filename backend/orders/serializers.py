from rest_framework import serializers
from .models import Order,OrderItem
class OrderItemSerializer(serializers.ModelSerializer):
 product_name=serializers.CharField(source="product.name",read_only=True)
 seller_name=serializers.CharField(source="seller.username",read_only=True)
 class Meta: model=OrderItem; fields=["id","product","product_name","seller","seller_name","quantity","price","subtotal"]
class OrderSerializer(serializers.ModelSerializer):
 items=OrderItemSerializer(many=True,read_only=True)
 class Meta:
  model=Order; fields=["id","total_amount","status","payment_status","razorpay_order_id","delivery_name","delivery_phone","delivery_address","delivery_city","delivery_district","delivery_state","delivery_pincode","created_at","updated_at","items"]
  read_only_fields=["total_amount","status","payment_status","razorpay_order_id","created_at","updated_at"]
