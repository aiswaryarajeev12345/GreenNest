from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Profile


@receiver(post_save, sender=User)
def create_profile_for_new_user(sender, instance, created, **kwargs):
    """Create exactly one Profile whenever a User is created."""
    if not created:
        return

    role = Profile.Role.ADMIN if instance.is_superuser else Profile.Role.GROWER
    Profile.objects.get_or_create(user=instance, defaults={"role": role})
