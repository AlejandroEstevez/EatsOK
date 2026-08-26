from rest_framework import serializers

from food_profiles.models import Restriction

from .models import Recipe, RecipeRestriction


class RecipeRestrictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeRestriction
        fields = [
            "id",
            "restriction",
            "relation_type",
        ]

class RecipeSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(
        read_only=True,
    )

    restrictions = serializers.PrimaryKeyRelatedField(
        queryset=Restriction.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = Recipe
        fields = [
            "id",
            "author",
            "establishment",
            "title",
            "description",
            "ingredients",
            "steps",
            "preparation_time",
            "publication_date",
            "visible",
            "restrictions",
            "image_url",
        ]

        read_only_fields = [
            "publication_date",
        ]

    def validate_establishment(self, establishment):
        if establishment is None:
            return establishment

        user = self.context["request"].user

        if user.role != user.Role.OWNER:
            raise serializers.ValidationError(
                "Only owners can associate recipes with establishments."
            )

        if establishment.owner != user:
            raise serializers.ValidationError(
                "You can only associate recipes with your own establishments."
            )

        return establishment
