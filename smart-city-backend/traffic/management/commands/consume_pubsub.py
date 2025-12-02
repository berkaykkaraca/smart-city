import json
import logging
from typing import Any, Dict

from django.conf import settings
from django.core.management.base import BaseCommand

from google.cloud import pubsub_v1
from google.api_core.exceptions import GoogleAPIError

from traffic.models import TrafficEvent

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Consume traffic events from Google Pub/Sub and persist them via Django ORM."

    def handle(self, *args, **options):
        subscriber = pubsub_v1.SubscriberClient()
        subscription_path = subscriber.subscription_path(
            settings.GOOGLE_CLOUD_PROJECT,
            settings.PUBSUB_SUBSCRIPTION,
        )

        self.stdout.write(self.style.SUCCESS(f"Listening on {subscription_path}"))

        def callback(message: pubsub_v1.subscriber.message.Message) -> None:
            try:
                data: Dict[str, Any] = json.loads(message.data.decode("utf-8"))
                TrafficEvent.objects.create(
                    sensor_id=data["sensor_id"],
                    location=data["location"],
                    vehicle_count=int(data["vehicle_count"]),
                    average_speed_kmh=float(data["average_speed_kmh"]),
                )
                logger.info("Persisted traffic event from Pub/Sub: %s", data)
                message.ack()
            except Exception as exc:  # pragma: no cover - runtime command
                logger.exception("Failed to process Pub/Sub message: %s", exc)
                message.nack()

        try:
            streaming_pull_future = subscriber.subscribe(
                subscription_path, callback=callback
            )
            self.stdout.write(self.style.WARNING("Press Ctrl+C to stop."))
            streaming_pull_future.result()
        except GoogleAPIError as exc:
            logger.exception("Pub/Sub error: %s", exc)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Stopping consumer..."))
        finally:
            subscriber.close()



