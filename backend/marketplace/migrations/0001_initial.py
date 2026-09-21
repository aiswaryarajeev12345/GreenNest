from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial=True
    dependencies=[migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations=[migrations.CreateModel(name="Product",fields=[
        ("id",models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name="ID")),
        ("name",models.CharField(max_length=180)),("description",models.TextField()),
        ("category",models.CharField(choices=[("Vegetables","Vegetables"),("Fruits","Fruits"),("Herbs","Herbs"),("Seeds","Seeds"),("Plants","Plants"),("Gardening Materials","Gardening Materials"),("Garden Kits","Garden Kits"),("Other","Other")],max_length=40)),
        ("price",models.DecimalField(decimal_places=2,max_digits=10)),("quantity",models.PositiveIntegerField()),("unit",models.CharField(default="item",max_length=30)),
        ("image",models.ImageField(blank=True,null=True,upload_to="products/")),("location",models.CharField(blank=True,max_length=150)),("is_available",models.BooleanField(default=True)),
        ("created_at",models.DateTimeField(auto_now_add=True)),("updated_at",models.DateTimeField(auto_now=True)),
        ("seller",models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name="products",to=settings.AUTH_USER_MODEL))],options={"ordering":["-created_at"]})]
