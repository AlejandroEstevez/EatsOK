from rest_framework import serializers


class SearchLocationSerializer(serializers.Serializer):
    address = serializers.CharField()
    city = serializers.CharField()
    latitude = serializers.FloatField(allow_null=True)
    longitude = serializers.FloatField(allow_null=True)


class EstablishmentSearchSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField()
    location = SearchLocationSerializer()
    average_rating = serializers.FloatField(allow_null=True)
    distance = serializers.FloatField(allow_null=True)
    compatible_dishes = serializers.IntegerField()
    total_dishes = serializers.IntegerField()
    compatible_percentage = serializers.FloatField()


class RecipeSearchSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    preparation_time = serializers.IntegerField(allow_null=True)
    average_rating = serializers.FloatField(allow_null=True)
    establishment_id = serializers.IntegerField(allow_null=True)
    establishment_name = serializers.CharField(allow_null=True)
