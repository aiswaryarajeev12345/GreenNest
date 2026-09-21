from rest_framework import serializers
from .models import ExchangeListing,ExchangeRequest
class ListingSerializer(serializers.ModelSerializer):
 owner_name=serializers.CharField(source="owner.username",read_only=True)
 request_count=serializers.SerializerMethodField()
 def get_request_count(self,obj): return obj.requests.count()
 class Meta:
  model=ExchangeListing; fields=["id","owner","owner_name","title","description","category","image","location","status","request_count","created_at","updated_at"]; read_only_fields=["owner","status"]
class RequestSerializer(serializers.ModelSerializer):
 requester_name=serializers.CharField(source="requester.username",read_only=True)
 class Meta:
  model=ExchangeRequest; fields=["id","listing","requester","requester_name","message","offered_item","status","created_at","updated_at"]; read_only_fields=["requester","listing","status"]
