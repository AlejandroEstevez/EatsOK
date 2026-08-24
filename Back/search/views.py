from django.db.models import Avg, Q

from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from establishments.models import Establishment
from food_profiles.models import Restriction

from .serializers import EstablishmentSearchSerializer
from .services import (
    calculate_distance,
    get_active_restrictions,
    get_compatible_dishes,
)


class EstablishmentSearchView(generics.GenericAPIView):
    serializer_class = EstablishmentSearchSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get("search", "").strip()

        use_profile = self._parse_bool(
            request.query_params.get("use_profile", "true")
        )

        restriction_ids = self._parse_restriction_ids(
            request.query_params.get("restrictions")
        )

        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        radius = request.query_params.get("radius", "10")
        ordering = request.query_params.get("ordering", "")

        active_restrictions = get_active_restrictions(
            request.user,
            use_profile=use_profile,
            additional_restriction_ids=restriction_ids,
        )

        establishments = Establishment.objects.filter(
            active=True
        ).select_related(
            "location"
        ).prefetch_related(
            "tags",
            "dishes__dish_restrictions__restriction",
        ).annotate(
            average_rating=Avg(
                "reviews__rating",
                filter=Q(reviews__visible=True),
            )
        )

        if search:
            establishments = establishments.filter(
                Q(name__icontains=search)
                | Q(dishes__name__icontains=search)
                | Q(tags__name__icontains=search)
            ).distinct()

        coordinates = self._parse_coordinates(
            latitude,
            longitude,
            radius,
        )

        results = []

        for establishment in establishments:
            compatible_dishes = get_compatible_dishes(
                establishment,
                active_restrictions,
            )

            total_dishes = establishment.dishes.filter(
                available=True
            ).count()

            compatible_count = compatible_dishes.count()

            compatible_percentage = (
                compatible_count / total_dishes * 100
                if total_dishes > 0
                else 0
            )

            distance = None

            if coordinates is not None:
                location = establishment.location

                if (
                    location.latitude is None
                    or location.longitude is None
                ):
                    continue

                distance = calculate_distance(
                    coordinates["latitude"],
                    coordinates["longitude"],
                    location.latitude,
                    location.longitude,
                )

                if distance > coordinates["radius"]:
                    continue

            results.append({
                "id": establishment.id,
                "name": establishment.name,
                "description": establishment.description,
                "location": {
                    "address": establishment.location.address,
                    "city": establishment.location.city,
                    "latitude": establishment.location.latitude,
                    "longitude": establishment.location.longitude,
                },
                "average_rating": establishment.average_rating,
                "distance": round(distance, 2) if distance is not None else None,
                "compatible_dishes": compatible_count,
                "total_dishes": total_dishes,
                "compatible_percentage": round(
                    compatible_percentage,
                    2,
                ),
            })

        results = self._order_results(
            results,
            ordering,
        )

        serializer = self.get_serializer(
            results,
            many=True,
        )

        return Response(serializer.data)

    def _parse_bool(self, value):
        value = str(value).lower()

        if value in ["true", "1", "yes"]:
            return True

        if value in ["false", "0", "no"]:
            return False

        raise ValidationError(
            {"use_profile": "Must be true or false."}
        )

    def _parse_restriction_ids(self, value):
        if not value:
            return []

        try:
            restriction_ids = [
                int(restriction_id)
                for restriction_id in value.split(",")
                if restriction_id
            ]
        except ValueError:
            raise ValidationError(
                "Restrictions must be provided as comma-separated IDs."
            )

        existing_ids = set(
            Restriction.objects.filter(
                id__in=restriction_ids
            ).values_list(
                "id",
                flat=True,
            )
        )

        if existing_ids != set(restriction_ids):
            raise ValidationError(
                "One or more restrictions do not exist."
            )

        return restriction_ids
    
    def _parse_coordinates(self, latitude, longitude, radius):
        has_latitude = latitude is not None
        has_longitude = longitude is not None

        if has_latitude != has_longitude:
            raise ValidationError(
                "Latitude and longitude must be provided together."
            )

        if not has_latitude:
            return None

        try:
            latitude = float(latitude)
            longitude = float(longitude)
            radius = float(radius)
        except ValueError:
            raise ValidationError(
                "Latitude, longitude and radius must be valid numbers."
            )

        if radius <= 0:
            raise ValidationError(
                "Radius must be greater than zero."
            )

        return {
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius,
        }


    def _order_results(self, results, ordering):
        valid_orderings = {
            "rating",
            "-rating",
            "distance",
            "-distance",
            "compatible_dishes",
            "-compatible_dishes",
            "compatible_percentage",
            "-compatible_percentage",
        }

        if not ordering:
            return results

        if ordering not in valid_orderings:
            raise ValidationError(
                "Invalid ordering option."
            )

        reverse = ordering.startswith("-")
        field = ordering.lstrip("-")

        field_map = {
            "rating": "average_rating",
            "distance": "distance",
            "compatible_dishes": "compatible_dishes",
            "compatible_percentage": "compatible_percentage",
        }

        result_field = field_map[field]

        return sorted(
            results,
            key=lambda result: (
                result[result_field] is None,
                result[result_field],
            ),
            reverse=reverse,
        )
