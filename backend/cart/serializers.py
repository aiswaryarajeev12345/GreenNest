from rest_framework import serializers
from .models import Cart,CartItem
class CartItemSerializer(serializers.ModelSerializer):
 product_name=serializers.CharField(source="product.name",read_only=True)
 product_image=serializers.ImageField(source="product.image",read_only=True)
 price=serializers.DecimalField(source="product.price",max_digits=10,decimal_places=2,read_only=True)
 subtotal=serializers.SerializerMethodField()
 class Meta: model=CartItem; fields=["id","product","product_name","product_image","price","quantity","subtotal"]
 def get_subtotal(self,obj): return obj.product.price*obj.quantity
class CartSerializer(serializers.ModelSerializer):
 items=CartItemSerializer(many=True,read_only=True)
 subtotal=serializers.SerializerMethodField()
 class Meta: model=Cart; fields=["id","items","subtotal"]
 def get_subtotal(self,obj): return sum((x.product.price*x.quantity for x in obj.items.select_related("product").all()),0)
