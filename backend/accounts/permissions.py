from rest_framework.permissions import BasePermission

from .models import Profile


class IsOwnerProfile(BasePermission):
    """Object-level permission: a user may only touch their own profile."""

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id


class IsAdminRole(BasePermission):
    """Grants access only to users whose profile role is ADMIN."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == Profile.Role.ADMIN
        )
