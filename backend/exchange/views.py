from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import ExchangeListing, ExchangeRequest
from .serializers import ListingSerializer, RequestSerializer


class ListingViewSet(ModelViewSet):
    queryset = (
        ExchangeListing.objects
        .select_related("owner")
        .prefetch_related("requests")
        .order_by("-created_at")
    )

    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        category = self.request.query_params.get("category")

        if category and category != "All":
            queryset = queryset.filter(category=category)

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def update(self, request, *args, **kwargs):
        listing = self.get_object()

        if listing.owner_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "Only the owner can edit this listing."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        listing = self.get_object()

        if listing.owner_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "Only the owner can edit this listing."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        listing = self.get_object()

        if listing.owner_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "Only the owner can delete this listing."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_request(request, pk):
    listing = get_object_or_404(
        ExchangeListing,
        pk=pk,
    )

    if listing.owner_id == request.user.id:
        return Response(
            {
                "detail": (
                    "You cannot request your own listing."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if listing.status != "AVAILABLE":
        return Response(
            {
                "detail": (
                    "This listing is not available "
                    "for exchange right now."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Prevent the same user from creating duplicate
    # pending requests for the same listing.
    existing_request = ExchangeRequest.objects.filter(
        listing=listing,
        requester=request.user,
        status="PENDING",
    ).exists()

    if existing_request:
        return Response(
            {
                "detail": (
                    "You already have a pending request "
                    "for this listing."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = RequestSerializer(
        data=request.data
    )

    serializer.is_valid(raise_exception=True)

    exchange_request = serializer.save(
        listing=listing,
        requester=request.user,
    )

    listing.status = "PENDING"
    listing.save(update_fields=["status"])

    return Response(
        RequestSerializer(exchange_request).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def my_requests(request):
    queryset = (
        ExchangeRequest.objects
        .select_related("listing", "requester")
        .filter(requester=request.user)
        .order_by("-created_at")
    )

    if request.method == "GET":
        return Response(
            RequestSerializer(
                queryset,
                many=True,
            ).data
        )

    request_id = request.data.get("id")

    exchange_request = get_object_or_404(
        queryset,
        pk=request_id,
    )

    new_status = request.data.get("status")

    if new_status != "CANCELLED":
        return Response(
            {
                "detail": (
                    "You can only cancel a pending request."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if exchange_request.status != "PENDING":
        return Response(
            {
                "detail": (
                    "Only pending requests can be cancelled."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    exchange_request.status = "CANCELLED"
    exchange_request.save(update_fields=["status"])

    listing = exchange_request.listing

    # If this was the only pending request, make the
    # listing available again.
    has_pending_requests = ExchangeRequest.objects.filter(
        listing=listing,
        status="PENDING",
    ).exists()

    if (
        listing.status == "PENDING"
        and not has_pending_requests
    ):
        listing.status = "AVAILABLE"
        listing.save(update_fields=["status"])

    return Response(
        RequestSerializer(exchange_request).data
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def owner_requests(request):
    queryset = (
        ExchangeRequest.objects
        .select_related(
            "listing",
            "requester",
        )
        .filter(listing__owner=request.user)
        .order_by("-created_at")
    )

    return Response(
        RequestSerializer(
            queryset,
            many=True,
        ).data
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def owner_request_action(request, pk):
    exchange_request = get_object_or_404(
        ExchangeRequest.objects.select_related("listing"),
        pk=pk,
    )

    listing = exchange_request.listing

    if listing.owner_id != request.user.id:
        return Response(
            {
                "detail": (
                    "Only the listing owner can "
                    "manage this request."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    new_status = request.data.get("status")

    if new_status not in [
        "ACCEPTED",
        "REJECTED",
        "COMPLETED",
    ]:
        return Response(
            {
                "detail": (
                    "Invalid exchange request status."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if (
        new_status == "ACCEPTED"
        and exchange_request.status != "PENDING"
    ):
        return Response(
            {
                "detail": (
                    "Only pending requests can be accepted."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if (
        new_status == "REJECTED"
        and exchange_request.status != "PENDING"
    ):
        return Response(
            {
                "detail": (
                    "Only pending requests can be rejected."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if (
        new_status == "COMPLETED"
        and exchange_request.status != "ACCEPTED"
    ):
        return Response(
            {
                "detail": (
                    "Only an accepted exchange can "
                    "be marked completed."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    exchange_request.status = new_status
    exchange_request.save(update_fields=["status"])

    if new_status == "ACCEPTED":
        listing.status = "ACCEPTED"
        listing.save(update_fields=["status"])

        # Reject other pending requests for the same
        # listing because one exchange has been accepted.
        ExchangeRequest.objects.filter(
            listing=listing,
            status="PENDING",
        ).exclude(
            pk=exchange_request.pk
        ).update(
            status="REJECTED"
        )

    elif new_status == "REJECTED":
        has_pending_requests = ExchangeRequest.objects.filter(
            listing=listing,
            status="PENDING",
        ).exists()

        if not has_pending_requests:
            listing.status = "AVAILABLE"
            listing.save(update_fields=["status"])

    elif new_status == "COMPLETED":
        listing.status = "COMPLETED"
        listing.save(update_fields=["status"])

    return Response(
        RequestSerializer(exchange_request).data
    )