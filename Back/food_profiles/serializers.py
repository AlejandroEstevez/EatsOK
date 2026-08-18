from rest_framework import serializers

from .models import (
    Allergy,
    Diet,
    FoodProfile,
    Restriction,
)


class RestrictionSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()

    class Meta:
        model = Restriction
        fields = [
            "id",
            "name",
            "type",
        ]

    def get_type(self, obj):
        if Allergy.objects.filter(pk=obj.pk).exists():
            return "allergy"

        if Diet.objects.filter(pk=obj.pk).exists():
            return "diet"

        return "restriction"


class FoodProfileSerializer(serializers.ModelSerializer):
    restrictions = RestrictionSerializer(
        many=True,
        read_only=True,
    )

    restriction_ids = serializers.PrimaryKeyRelatedField(
        source="restrictions",
        queryset=Restriction.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = FoodProfile
        fields = [
            "id",
            "enabled",
            "modified_at",
            "restrictions",
            "restriction_ids",
        ]

        read_only_fields = [
            "id",
            "modified_at",
        ]

    def update(self, instance, validated_data):
        restrictions = validated_data.pop(
            "restrictions",
            None,
        )

        instance = super().update(
            instance,
            validated_data,
        )

        if restrictions is not None:
            instance.restrictions.set(restrictions)

        return instance
