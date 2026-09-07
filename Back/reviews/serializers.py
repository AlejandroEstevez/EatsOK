from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(
        read_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "author",
            "establishment",
            "recipe",
            "rating",
            "comment",
            "publication_date",
            "visible",
        ]

        read_only_fields = [
            "publication_date",
            "visible",
        ]

    def validate(self, attrs):
        instance = self.instance

        establishment = attrs.get(
            "establishment",
            instance.establishment if instance else None,
        )

        recipe = attrs.get(
            "recipe",
            instance.recipe if instance else None,
        )

        # A review must target exactly one type of resource.
        if establishment is None and recipe is None:
            raise serializers.ValidationError(
                "A review must be associated with an establishment or a recipe."
            )

        if establishment is not None and recipe is not None:
            raise serializers.ValidationError(
                "A review cannot be associated with both an establishment and a recipe."
            )

        # A user can only publish one review per resource.
        user = self.context["request"].user

        reviews = Review.objects.filter(
            author=user,
        )

        if instance is not None:
            reviews = reviews.exclude(
                pk=instance.pk,
            )

        if (
            establishment is not None
            and reviews.filter(
                establishment=establishment,
            ).exists()
        ):
            raise serializers.ValidationError("You have already reviewed this establishment.")

        if (
            recipe is not None
            and reviews.filter(
                recipe=recipe,
            ).exists()
        ):
            raise serializers.ValidationError("You have already reviewed this recipe.")

        return attrs


class ReviewModerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            "visible",
        ]
