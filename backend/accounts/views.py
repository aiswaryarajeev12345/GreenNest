from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Profile
from .serializers import (
    GreenNestTokenObtainPairSerializer,
    ProfileSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(APIView):
    """
    POST /api/v1/auth/register/
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "message": "Registration successful.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/
    """

    permission_classes = [AllowAny]

    serializer_class = (
        GreenNestTokenObtainPairSerializer
    )


class ProfileView(APIView):
    """
    GET /api/v1/auth/profile/
    PUT /api/v1/auth/profile/
    """

    permission_classes = [
        IsAuthenticated
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get(self, request):
        return Response(
            UserSerializer(
                request.user
            ).data
        )

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={
                "role": (
                    Profile.Role.ADMIN
                    if request.user.is_superuser
                    else Profile.Role.GROWER
                )
            },
        )

        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            UserSerializer(
                request.user
            ).data
        )

    def patch(self, request):
        return self.put(request)


# ======================================================
# ADMIN STATISTICS
# ======================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_statistics(request):
    """
    GET /api/v1/auth/admin/statistics/
    """

    if not request.user.is_superuser:
        return Response(
            {
                "detail": "Admin access required."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    from community.models import Post
    from marketplace.models import Product
    from exchange.models import ExchangeListing
    from classes.models import ExpertClass
    from orders.models import Order

    return Response(
        {
            "users": User.objects.count(),
            "community_posts": Post.objects.count(),
            "products": Product.objects.count(),
            "exchanges": ExchangeListing.objects.count(),
            "expert_classes": ExpertClass.objects.count(),
            "orders": Order.objects.count(),
        }
    )


# ======================================================
# ADMIN ACTIVITY / MONITOR
# ======================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_activity(request):
    """
    GET /api/v1/auth/admin/activity/
    """

    if not request.user.is_superuser:
        return Response(
            {
                "detail": "Admin access required."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    from community.models import Post
    from marketplace.models import Product
    from exchange.models import ExchangeListing
    from classes.models import ExpertClass
    from orders.models import Order

    # --------------------------------------------------
    # USERS
    # --------------------------------------------------

    users = User.objects.order_by(
        "-date_joined"
    )[:5]

    user_data = []

    for user in users:
        user_data.append(
            {
                "id": user.id,
                "username": user.username,
                "date": user.date_joined,
            }
        )

    # --------------------------------------------------
    # COMMUNITY POSTS
    # --------------------------------------------------

    posts = Post.objects.order_by(
        "-created_at"
    )[:5]

    post_data = []

    for post in posts:
        post_data.append(
            {
                "id": post.id,
                "title": getattr(
                    post,
                    "title",
                    "Community Post",
                ),
                "date": post.created_at,
            }
        )

    # --------------------------------------------------
    # PRODUCTS
    # --------------------------------------------------

    products = Product.objects.order_by(
        "-created_at"
    )[:5]

    product_data = []

    for product in products:
        product_data.append(
            {
                "id": product.id,
                "name": product.name,
                "date": product.created_at,
            }
        )

    # --------------------------------------------------
    # EXCHANGE
    # --------------------------------------------------

    exchanges = ExchangeListing.objects.order_by(
        "-created_at"
    )[:5]

    exchange_data = []

    for exchange in exchanges:
        exchange_data.append(
            {
                "id": exchange.id,
                "title": getattr(
                    exchange,
                    "title",
                    "Exchange Listing",
                ),
                "date": exchange.created_at,
            }
        )

    # --------------------------------------------------
    # EXPERT CLASSES
    # --------------------------------------------------

    classes = ExpertClass.objects.order_by(
        "-created_at"
    )[:5]

    class_data = []

    for expert_class in classes:
        class_data.append(
            {
                "id": expert_class.id,
                "title": expert_class.title,
                "date": expert_class.created_at,
            }
        )

    # --------------------------------------------------
    # ORDERS
    # --------------------------------------------------

    orders = Order.objects.order_by(
        "-created_at"
    )[:5]

    order_data = []

    for order in orders:
        order_data.append(
            {
                "id": order.id,
                "status": order.status,
                "date": order.created_at,
            }
        )

    return Response(
        {
            "users": user_data,
            "posts": post_data,
            "products": product_data,
            "exchanges": exchange_data,
            "classes": class_data,
            "orders": order_data,
        }
    )