from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError, transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "phone",
            "role",
            "bio",
            "location",
            "gardening_experience",
            "avatar",
            "created_at",
        ]
        read_only_fields = ["role", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile",
        ]

    def get_profile(self, user):
        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={
                "role": (
                    Profile.Role.ADMIN
                    if user.is_superuser
                    else Profile.Role.GROWER
                )
            },
        )
        return ProfileSerializer(profile).data


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=150,
        trim_whitespace=True,
    )

    email = serializers.EmailField()

    phone = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    role = serializers.ChoiceField(
        choices=[
            (role.value, role.label)
            for role in Profile.PUBLIC_ROLES
        ]
    )

    def validate_username(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        if User.objects.filter(
            username__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_role(self, value):
        if value == Profile.Role.ADMIN:
            raise serializers.ValidationError(
                "Public registration cannot create an admin account."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )

        validate_password(attrs["password"])

        return attrs

    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data["email"]
        phone = validated_data.get("phone", "")
        role = validated_data["role"]

        if User.objects.filter(
            username__iexact=username
        ).exists():
            raise serializers.ValidationError(
                {
                    "username": "This username is already taken."
                }
            )

        if User.objects.filter(
            email__iexact=email
        ).exists():
            raise serializers.ValidationError(
                {
                    "email": (
                        "An account with this email "
                        "already exists."
                    )
                }
            )

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=validated_data["password"],
                )

                profile, _ = Profile.objects.get_or_create(
                    user=user,
                    defaults={
                        "role": role,
                        "phone": phone,
                    },
                )

                profile.phone = phone
                profile.role = role
                profile.save(
                    update_fields=["phone", "role"]
                )

                return user

        except IntegrityError as exc:
            error_message = str(exc).lower()

            if "username" in error_message:
                raise serializers.ValidationError(
                    {
                        "username": "This username is already taken."
                    }
                ) from exc

            if "email" in error_message:
                raise serializers.ValidationError(
                    {
                        "email": (
                            "An account with this email "
                            "already exists."
                        )
                    }
                ) from exc

            raise serializers.ValidationError(
                {
                    "detail": (
                        "Unable to create the account right now. "
                        "Please try again."
                    )
                }
            ) from exc


class GreenNestTokenObtainPairSerializer(
    TokenObtainPairSerializer
):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={
                "role": (
                    Profile.Role.ADMIN
                    if user.is_superuser
                    else Profile.Role.GROWER
                )
            },
        )

        token["role"] = profile.role

        return token