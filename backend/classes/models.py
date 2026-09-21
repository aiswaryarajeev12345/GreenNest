from django.conf import settings
from django.db import models


class ExpertClass(models.Model):
    MODES = [
        ("ONLINE", "Online"),
        ("OFFLINE", "Offline"),
    ]

    CATEGORIES = [
        (x, x)
        for x in [
            "Terrace Farming",
            "Vegetable Gardening",
            "Organic Gardening",
            "Seed Starting",
            "Composting",
            "Balcony Gardening",
            "Beginner Gardening",
            "Other",
        ]
    ]

    expert = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expert_classes",
    )

    title = models.CharField(max_length=180)

    description = models.TextField()

    image = models.ImageField(
        upload_to="classes/",
        blank=True,
        null=True,
    )

    category = models.CharField(
        max_length=40,
        choices=CATEGORIES,
    )

    date = models.DateField()

    start_time = models.TimeField()

    duration = models.PositiveIntegerField(
        help_text="Duration in minutes"
    )

    location = models.CharField(
        max_length=200,
        blank=True,
    )

    mode = models.CharField(
        max_length=10,
        choices=MODES,
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    max_seats = models.PositiveIntegerField(
        default=20
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title


class ClassEnrollment(models.Model):
    STATUS = [
        ("ACTIVE", "Active"),
        ("CANCELLED", "Cancelled"),
        ("COMPLETED", "Completed"),
    ]

    class_obj = models.ForeignKey(
        ExpertClass,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="class_enrollments",
    )

    joined_at = models.DateTimeField(
        auto_now_add=True
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS,
        default="ACTIVE",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["class_obj", "user"],
                name="unique_class_enrollment",
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.class_obj.title}"