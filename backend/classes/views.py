from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from accounts.models import Profile

from .models import ExpertClass, ClassEnrollment
from .serializers import ClassSerializer, EnrollmentSerializer


class ClassViewSet(ModelViewSet):

    queryset = (
        ExpertClass.objects
        .select_related("expert")
        .prefetch_related("enrollments")
        .order_by("-created_at")
    )

    serializer_class = ClassSerializer

    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_queryset(self):

        queryset = super().get_queryset()

        user = self.request.user

        role = user.profile.role

        # Expert dashboard:
        # show only classes created by this expert
        if (
            role == Profile.Role.EXPERT
            and self.request.query_params.get("mine") == "1"
        ):
            return queryset.filter(
                expert=user
            )

        # Expert needs to retrieve/edit/delete
        # their own class.
        #
        # This also works if their class is inactive.
        if (
            role == Profile.Role.EXPERT
            and self.action in [
                "retrieve",
                "update",
                "partial_update",
                "destroy",
            ]
        ):
            return queryset.filter(
                Q(is_active=True)
                | Q(expert=user)
            ).distinct()

        # Normal Classes page:
        # only active classes are visible.
        return queryset.filter(
            is_active=True
        )

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        if request.user.profile.role != Profile.Role.EXPERT:

            return Response(
                {
                    "detail": "Only experts can create classes."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(
            request,
            *args,
            **kwargs,
        )

    def perform_create(self, serializer):

        serializer.save(
            expert=self.request.user
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        class_obj = self.get_object()

        if class_obj.expert_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "Only the expert who created "
                        "this class can edit it."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(
            request,
            *args,
            **kwargs,
        )

    def partial_update(
        self,
        request,
        *args,
        **kwargs
    ):

        class_obj = self.get_object()

        if class_obj.expert_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "Only the expert who created "
                        "this class can edit it."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().partial_update(
            request,
            *args,
            **kwargs,
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        class_obj = self.get_object()

        if class_obj.expert_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "Only the class expert "
                        "can delete it."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(
            request,
            *args,
            **kwargs,
        )


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def enrollment(request, pk):

    try:

        class_obj = ExpertClass.objects.get(
            pk=pk,
            is_active=True,
        )

    except ExpertClass.DoesNotExist:

        return Response(
            {
                "detail": "Class not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # JOIN CLASS
    if request.method == "POST":

        existing = (
            ClassEnrollment.objects
            .filter(
                class_obj=class_obj,
                user=request.user,
            )
            .first()
        )

        if (
            existing
            and existing.status == "ACTIVE"
        ):

            return Response(
                {
                    "detail": (
                        "You already joined this class."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        active_count = (
            class_obj.enrollments
            .filter(
                status="ACTIVE"
            )
            .count()
        )

        if active_count >= class_obj.max_seats:

            return Response(
                {
                    "detail": "This class is full."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Re-join previously cancelled class
        if existing:

            existing.status = "ACTIVE"

            existing.save(
                update_fields=["status"]
            )

        else:

            existing = ClassEnrollment.objects.create(
                class_obj=class_obj,
                user=request.user,
            )

        return Response(
            EnrollmentSerializer(
                existing
            ).data,
            status=status.HTTP_201_CREATED,
        )

    # LEAVE CLASS

    enrollment_obj = (
        ClassEnrollment.objects
        .filter(
            class_obj=class_obj,
            user=request.user,
            status="ACTIVE",
        )
        .first()
    )

    if not enrollment_obj:

        return Response(
            {
                "detail": "You are not enrolled."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    enrollment_obj.status = "CANCELLED"

    enrollment_obj.save(
        update_fields=["status"]
    )

    return Response(
        status=status.HTTP_204_NO_CONTENT
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_classes(request):

    queryset = (
        ClassEnrollment.objects
        .select_related(
            "class_obj",
            "class_obj__expert",
        )
        .filter(
            user=request.user
        )
        .order_by("-joined_at")
    )

    return Response(
        EnrollmentSerializer(
            queryset,
            many=True,
        ).data
    )