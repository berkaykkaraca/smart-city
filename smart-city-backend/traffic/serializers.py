from rest_framework import serializers

from .models import TrafficEvent


class TrafficEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficEvent
        fields = [
            "id",
            "sensor_id",
            "location",
            "vehicle_count",
            "average_speed_kmh",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


