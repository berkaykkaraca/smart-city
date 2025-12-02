import json
import logging
from django.conf import settings
from django.core.management.base import BaseCommand
from google.cloud import pubsub_v1
from traffic.models import District, Signaller, TrafficEvent, Notification

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Consume traffic events from Google Pub/Sub with Relational Data."

    def handle(self, *args, **options):
        subscriber = pubsub_v1.SubscriberClient()
        subscription_path = subscriber.subscription_path(
            settings.GOOGLE_CLOUD_PROJECT,
            settings.PUBSUB_SUBSCRIPTION,
        )

        print(f"Listening on {subscription_path}...")

        def callback(message):
            try:
                data = json.loads(message.data.decode("utf-8"))

                # İlişkisel Veri Yönetimi
                # 1. District
                district_obj, _ = District.objects.get_or_create(
                    city_name=data.get("city_name", "Unknown"),
                    district_name=data.get("district_name", "Unknown"),
                )

                # 2. Signaller
                signaller_obj, _ = Signaller.objects.get_or_create(
                    district=district_obj,
                    road_name=data.get("road_name", "Unknown Road"),
                )

                # 3. Event
                event = TrafficEvent.objects.create(
                    signaller=signaller_obj,
                    average_kmh=int(data.get("average_kmh", 0)),
                    known_reason=data.get("known_reason"),
                    # expected_resolution_time parse işlemi gerekebilir, şimdilik None geçiyoruz
                )

                # 4. Notification
                Notification.objects.create(event=event)

                logger.info(
                    f"Persisted event: {signaller_obj} - {event.average_kmh} km/h"
                )
                message.ack()
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                message.nack()

        streaming_pull_future = subscriber.subscribe(
            subscription_path, callback=callback
        )
        try:
            streaming_pull_future.result()
        except KeyboardInterrupt:
            subscriber.close()
