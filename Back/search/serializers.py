from rest_framework import serializers


class SearchLocationSerializer(serializers.Serializer):
    address = serializers.CharField()
    city = serializers.CharField()
    latitude = serializers.FloatField(allow_null=True)
    longitude = serializers.FloatField(allow_null=True)


class SearchTagSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class SearchRestrictionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    type = serializers.CharField()


class EstablishmentSearchSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField()
    location = SearchLocationSerializer()
    tags = SearchTagSerializer(many=True)
    average_rating = serializers.FloatField(allow_null=True)
    review_count = serializers.IntegerField()
    distance = serializers.FloatField(allow_null=True)
    compatible_dishes = serializers.IntegerField()
    total_dishes = serializers.IntegerField()
    compatible_percentage = serializers.FloatField()
    image_url = serializers.URLField(allow_blank=True)


class RecipeSearchSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    preparation_time = serializers.IntegerField(allow_null=True)
    author = serializers.CharField()
    average_rating = serializers.FloatField(allow_null=True)
    review_count = serializers.IntegerField()
    adapted_restrictions = SearchRestrictionSerializer(many=True)
    publication_date = serializers.DateTimeField()
    establishment_id = serializers.IntegerField(allow_null=True)
    establishment_name = serializers.CharField(allow_null=True)
    image_url = serializers.URLField(allow_blank=True)
