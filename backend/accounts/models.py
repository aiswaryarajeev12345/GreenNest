from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    """
    Phase 1 user profile.

    Holds role and basic gardening/community info. Marketplace and
    garden-tracking fields are intentionally excluded until later phases.
    """

    class Role(models.TextChoices):
        GROWER = "GROWER", "Grower"
        SELLER = "SELLER", "Seller"
        EXPERT = "EXPERT", "Expert"
        ADMIN = "ADMIN", "Admin"

    # Roles a user may select for themselves during public registration.
    PUBLIC_ROLES = [Role.GROWER, Role.SELLER, Role.EXPERT]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.GROWER)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)
    gardening_experience = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g. Beginner, Intermediate, Experienced",
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
