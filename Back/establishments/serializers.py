from rest_framework import serializers

from food_profiles.models import Restriction

from .models import (
    Dish,
    DishRestriction,
    Establishment,
    Location,
    Tag,
)


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = [
            "id",
            "name",
            "description",
        ]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = [
            "id",
            "address",
            "city",
            "region",
            "country",
            "postal_code",
            "latitude",
            "longitude",
        ]


class DishRestrictionSerializer(serializers.ModelSerializer):
    restriction_name = serializers.CharField(
        source="restriction.name",
        read_only=True,
    )

    class Meta:
        model = DishRestriction
        fields = [
            "id",
            "restriction",
            "restriction_name",
            "presence_type",
        ]


class DishSerializer(serializers.ModelSerializer):
    dish_restrictions = DishRestrictionSerializer(
        many=True,
        required=False,
    )

    class Meta:
        model = Dish
        fields = [
            "id",
            "name",
            "description",
            "price",
            "available",
            "dish_restrictions",
            "image_url",
        ]

    def create(self, validated_data):
        restrictions_data = validated_data.pop(
            "dish_restrictions",
            [],
        )

        dish = Dish.objects.create(
            **validated_data,
        )

        self._set_restrictions(
            dish,
            restrictions_data,
        )

        return dish

    def update(self, instance, validated_data):
        restrictions_data = validated_data.pop(
            "dish_restrictions",
            None,
        )

        instance = super().update(
            instance,
            validated_data,
        )

        if restrictions_data is not None:
            instance.dish_restrictions.all().delete()

            self._set_restrictions(
                instance,
                restrictions_data,
            )

        return instance

    def _set_restrictions(
        self,
        dish,
        restrictions_data,
    ):
        for restriction_data in restrictions_data:
            DishRestriction.objects.create(
                dish=dish,
                **restriction_data,
            )


class EstablishmentSerializer(serializers.ModelSerializer):
    location = LocationSerializer()
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False,
    )

    owner = serializers.StringRelatedField(
        read_only=True,
    )

    dishes = DishSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Establishment
        fields = [
            "id",
            "owner",
            "name",
            "description",
            "phone",
            "email",
            "opening_time",
            "closing_time",
            "cross_contamination",
            "restrictions_info",
            "active",
            "location",
            "tags",
            "dishes",
            "image_url",
        ]

    def create(self, validated_data):
        location_data = validated_data.pop(
            "location",
        )

        tags = validated_data.pop(
            "tags",
            [],
        )

        establishment = Establishment.objects.create(
            **validated_data,
        )

        Location.objects.create(
            establishment=establishment,
            **location_data,
        )

        establishment.tags.set(tags)

        return establishment

    def update(self, instance, validated_data):
        location_data = validated_data.pop(
            "location",
            None,
        )

        tags = validated_data.pop(
            "tags",
            None,
        )

        instance = super().update(
            instance,
            validated_data,
        )

        if location_data is not None:
            location = instance.location

            for field, value in location_data.items():
                setattr(
                    location,
                    field,
                    value,
                )

            location.save()

        if tags is not None:
            instance.tags.set(tags)

        return instance
