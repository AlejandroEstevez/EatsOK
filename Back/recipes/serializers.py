from rest_framework import serializers

from food_profiles.models import Restriction

from .models import (
    Recipe,
    RecipeRestriction,
    RecipeRestrictionType,
)


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

    author_id = serializers.IntegerField(
        read_only=True,
    )

    restrictions = serializers.PrimaryKeyRelatedField(
        queryset=Restriction.objects.all(),
        many=True,
        required=False,
    )

    recipe_restrictions = RecipeRestrictionSerializer(
        many=True,
        required=False,
    )

    class Meta:
        model = Recipe
        fields = [
            "id",
            "author",
            "author_id",
            "establishment",
            "title",
            "description",
            "ingredients",
            "steps",
            "preparation_time",
            "publication_date",
            "visible",
            "restrictions",
            "recipe_restrictions",
            "image_url",
        ]

        read_only_fields = [
            "publication_date",
        ]

    def validate_recipe_restrictions(self, value):
        restriction_ids = [
            item["restriction"].id
            for item in value
        ]

        if len(restriction_ids) != len(
            set(restriction_ids)
        ):
            raise serializers.ValidationError(
                "A restriction cannot be both "
                "blocking and adapted."
            )

        return value

    def create(self, validated_data):
        restrictions = validated_data.pop(
            "restrictions",
            [],
        )

        recipe_restrictions = validated_data.pop(
            "recipe_restrictions",
            None,
        )

        recipe = Recipe.objects.create(
            **validated_data,
        )

        if recipe_restrictions is not None:
            self._set_recipe_restrictions(
                recipe,
                recipe_restrictions,
            )
        else:
            self._set_legacy_restrictions(
                recipe,
                restrictions,
            )

        return recipe

    def update(self, instance, validated_data):
        restrictions_provided = (
            "restrictions" in validated_data
        )

        recipe_restrictions_provided = (
            "recipe_restrictions"
            in validated_data
        )

        restrictions = validated_data.pop(
            "restrictions",
            [],
        )

        recipe_restrictions = validated_data.pop(
            "recipe_restrictions",
            [],
        )

        instance = super().update(
            instance,
            validated_data,
        )

        if recipe_restrictions_provided:
            instance.recipe_restrictions.all().delete()

            self._set_recipe_restrictions(
                instance,
                recipe_restrictions,
            )

        elif restrictions_provided:
            instance.recipe_restrictions.all().delete()

            self._set_legacy_restrictions(
                instance,
                restrictions,
            )

        return instance

    def _set_recipe_restrictions(
        self,
        recipe,
        restrictions_data,
    ):
        for restriction_data in restrictions_data:
            RecipeRestriction.objects.create(
                recipe=recipe,
                **restriction_data,
            )

    def _set_legacy_restrictions(
        self,
        recipe,
        restrictions,
    ):
        for restriction in restrictions:
            RecipeRestriction.objects.create(
                recipe=recipe,
                restriction=restriction,
                relation_type=(
                    RecipeRestrictionType.BLOCKS
                ),
            )

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
