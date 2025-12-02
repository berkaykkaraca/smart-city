from django.db import models


class TrafficEvent(models.Model):
    """
    Simple traffic data point coming from a sensor in the smart city.

    In a real system you might normalize location into a GeoDjango field or a
    separate table, but for this prototype we keep it simple.
    """

    sensor_id = models.CharField(max_length=100)
    location = models.CharField(
        max_length=255,
        help_text="Logical location of the sensor (e.g. 'Main St & 3rd Ave')",
    )
    vehicle_count = models.PositiveIntegerField(help_text="Number of vehicles detected")
    average_speed_kmh = models.FloatField(help_text="Average speed in km/h")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.sensor_id} @ {self.location} ({self.created_at})"
