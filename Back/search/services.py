from math import asin, cos, radians, sin, sqrt

from food_profiles.models import Restriction
from recipes.models import RecipeRestrictionType


def get_active_restrictions(user, use_profile=True, additional_restriction_ids=None):
    restriction_ids = set()

    if use_profile and user.role == user.Role.CLIENT:
        profile = getattr(
            user,
            "food_profile",
            None,
        )

        if profile and profile.enabled:
            restriction_ids.update(
                profile.restrictions.values_list(
                    "id",
                    flat=True,
                )
            )

    if additional_restriction_ids:
        restriction_ids.update(
            additional_restriction_ids,
        )

    return Restriction.objects.filter(
        id__in=restriction_ids,
    )


def get_compatible_dishes(establishment, active_restrictions):
    restriction_ids = active_restrictions.values_list("id", flat=True)

    return (
        establishment.dishes.filter(
            available=True,
        )
        .exclude(
            dish_restrictions__restriction_id__in=restriction_ids,
        )
        .distinct()
    )


def calculate_distance(lat1, lon1, lat2, lon2):
    earth_radius_km = 6371

    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1

    a = sin(delta_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(delta_lon / 2) ** 2

    c = 2 * asin(sqrt(a))

    return earth_radius_km * c


def is_recipe_compatible(recipe, active_restrictions):
    active_restriction_ids = {restriction.id for restriction in active_restrictions}

    blocked_restriction_ids = {
        relation.restriction_id
        for relation in recipe.recipe_restrictions.all()
        if relation.relation_type == RecipeRestrictionType.BLOCKS
    }

    return not bool(active_restriction_ids & blocked_restriction_ids)
