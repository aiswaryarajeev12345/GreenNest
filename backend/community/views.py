
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Post, PostLike, Comment
from .serializers import PostSerializer, CommentSerializer


class PostViewSet(ModelViewSet):
    queryset = (
        Post.objects
        .select_related(
            "author",
            "author__profile",
        )
        .prefetch_related(
            "likes",
            "comments",
        )
    )

    serializer_class = PostSerializer

    # All post operations require login.
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()

        category = self.request.query_params.get(
            "category"
        )

        if category and category != "All":
            qs = qs.filter(
                category=category
            )

        return qs

    def perform_create(self, serializer):
        # The backend decides who the author is.
        # A user cannot create a post for another user.
        serializer.save(
            author=self.request.user
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):
        post = self.get_object()

        # Only the owner can edit the post.
        if post.author_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You can only edit "
                        "your own post."
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
        post = self.get_object()

        # Protect PATCH requests too.
        if post.author_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You can only edit "
                        "your own post."
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
        post = self.get_object()

        # Only the owner can delete the post.
        if post.author_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You can only delete "
                        "your own post."
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
def like_post(request, pk):
    try:
        post = Post.objects.get(
            pk=pk
        )
    except Post.DoesNotExist:
        return Response(
            {
                "detail": "Post not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    like = (
        PostLike.objects
        .filter(
            user=request.user,
            post=post,
        )
        .first()
    )

    if request.method == "POST":

        # UniqueConstraint in the model also
        # protects against duplicate likes.
        if not like:
            PostLike.objects.create(
                user=request.user,
                post=post,
            )

        liked = True

    else:
        if like:
            like.delete()

        liked = False

    return Response(
        {
            "like_count": post.likes.count(),
            "liked_by_current_user": liked,
        }
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def comments(request, pk):
    try:
        post = Post.objects.get(
            pk=pk
        )
    except Post.DoesNotExist:
        return Response(
            {
                "detail": "Post not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # GET comments
    if request.method == "GET":
        return Response(
            CommentSerializer(
                post.comments.all(),
                many=True,
            ).data
        )

    # POST comment
    serializer = CommentSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    # Backend decides the post and user.
    # User cannot comment as somebody else
    # or attach the comment to another post.
    comment = serializer.save(
        post=post,
        user=request.user,
    )

    return Response(
        CommentSerializer(comment).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def comment_detail(request, pk):
    try:
        comment = Comment.objects.get(
            pk=pk
        )
    except Comment.DoesNotExist:
        return Response(
            {
                "detail": "Comment not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # Only the comment owner can modify it.
    if comment.user_id != request.user.id:
        return Response(
            {
                "detail": (
                    "You can only modify "
                    "your own comment."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # DELETE comment
    if request.method == "DELETE":
        comment.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

    # PUT comment
    serializer = CommentSerializer(
        comment,
        data=request.data,
        partial=True,
    )

    serializer.is_valid(
        raise_exception=True
    )

    # post and user are read-only in the serializer,
    # so they cannot be changed by the user.
    serializer.save()

    return Response(
        CommentSerializer(
            comment
        ).data
    )

