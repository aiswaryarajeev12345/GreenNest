from rest_framework import serializers
from .models import ExpertClass,ClassEnrollment
class ClassSerializer(serializers.ModelSerializer):
 expert_name=serializers.CharField(source="expert.username",read_only=True)
 seats_taken=serializers.SerializerMethodField()
 class Meta:
  model=ExpertClass; fields=["id","expert","expert_name","title","description","image","category","date","start_time","duration","location","mode","price","max_seats","seats_taken","is_active","created_at","updated_at"]; read_only_fields=["expert","seats_taken"]
 def get_seats_taken(self,obj): return obj.enrollments.filter(status="ACTIVE").count()
class EnrollmentSerializer(serializers.ModelSerializer):
 class_title=serializers.CharField(source="class_obj.title",read_only=True)
 class Meta:
  model=ClassEnrollment; fields=["id","class_obj","class_title","user","joined_at","status"]; read_only_fields=["user","class_obj","status"]
