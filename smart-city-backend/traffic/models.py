from django.db import models


class District(models.Model):
    """
    Şehir ve İlçe bilgisini tutar.
    Örn: Istanbul / Kadikoy
    """

    city_name = models.CharField(max_length=50)
    district_name = models.CharField(max_length=50)

    class Meta:
        unique_together = ("city_name", "district_name")

    def __str__(self):
        return f"{self.city_name}/{self.district_name}"


class Signaller(models.Model):
    """
    Trafik verisini toplayan sinyal vericiler (Sensörler).
    Bir ilçede birden fazla olabilir.
    """

    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name="signallers"
    )
    road_name = models.CharField(max_length=60)
    active = models.BooleanField(
        default=True
    )  # Parantez eklendi ve varsayılan değer atandı

    def __str__(self):
        return f"{self.district} - {self.road_name}"


class TrafficEvent(models.Model):
    """
    Sinyal vericiden gelen anlık trafik olayı.
    """

    signaller = models.ForeignKey(
        Signaller, on_delete=models.CASCADE, related_name="events"
    )
    average_kmh = models.IntegerField()
    # Reason: High vehicle population, traffic accidents, etc.
    known_reason = models.CharField(max_length=100, null=True, blank=True, default=None)
    expected_resolution_time = models.DateTimeField(null=True, blank=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True)  # Sıralama yapmak için ekledim

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Event at {self.signaller.road_name}: {self.average_kmh} km/h"


class Notification(models.Model):
    """
    Trafik olayı oluştuğunda yayınlanan bildirim.
    """

    event = models.ForeignKey(
        TrafficEvent, on_delete=models.CASCADE, related_name="notifications"
    )
    publish_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.event}"
