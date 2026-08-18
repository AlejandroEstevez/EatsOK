from django.db import migrations


ALLERGIES = [
    ("GLUTEN", "Gluten"),
    ("CRUSTACEANS", "Crustáceos"),
    ("EGGS", "Huevos"),
    ("FISH", "Pescado"),
    ("PEANUTS", "Cacahuetes"),
    ("SOY", "Soja"),
    ("DAIRY", "Lácteos"),
    ("NUTS", "Frutos de cáscara"),
    ("CELERY", "Apio"),
    ("MUSTARD", "Mostaza"),
    ("SESAME", "Semillas de sésamo"),
    ("SULPHITES", "Dióxido de azufre y sulfitos"),
    ("LUPIN", "Altramuces"),
    ("MOLLUSCS", "Moluscos"),
]


DIETS = [
    ("VEGETARIAN", "Vegetariano"),
    ("VEGAN", "Vegano"),
    ("PESCETARIAN", "Pescetariano"),
    ("HALAL", "Halal"),
    ("KOSHER", "Kosher"),
]


def populate_restrictions(apps, schema_editor):
    Allergy = apps.get_model("food_profiles", "Allergy")
    Diet = apps.get_model("food_profiles", "Diet")

    for allergy_type, name in ALLERGIES:
        Allergy.objects.get_or_create(
            allergy_type=allergy_type,
            defaults={
                "name": name,
            },
        )

    for diet_type, name in DIETS:
        Diet.objects.get_or_create(
            diet_type=diet_type,
            defaults={
                "name": name,
            },
        )


def remove_restrictions(apps, schema_editor):
    Allergy = apps.get_model("food_profiles", "Allergy")
    Diet = apps.get_model("food_profiles", "Diet")

    Allergy.objects.filter(
        allergy_type__in=[
            allergy_type
            for allergy_type, _ in ALLERGIES
        ],
    ).delete()

    Diet.objects.filter(
        diet_type__in=[
            diet_type
            for diet_type, _ in DIETS
        ],
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("food_profiles", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            populate_restrictions,
            remove_restrictions,
        ),
    ]
