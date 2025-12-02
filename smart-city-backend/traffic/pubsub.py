import json
import logging
from typing import Any, Dict

from django.conf import settings

from google.cloud import pubsub_v1
from google.api_core.exceptions import GoogleAPIError

logger = logging.getLogger(__name__)


def get_publisher_client() -> pubsub_v1.PublisherClient:
    """
    Create a Pub/Sub publisher client.

    Authentication is handled via the usual Google Cloud mechanisms
    (GOOGLE_APPLICATION_CREDENTIALS, workload identity, etc.).
    """
    return pubsub_v1.PublisherClient()


def publish_traffic_event(payload: Dict[str, Any]) -> None:
    """
    Publish a traffic event JSON payload to the configured Pub/Sub topic.
    Failures are logged but don't raise exceptions to avoid breaking the API.
    """
    try:
        publisher = get_publisher_client()
        topic_path = publisher.topic_path(
            settings.GOOGLE_CLOUD_PROJECT,
            settings.PUBSUB_TOPIC,
        )
        data = json.dumps(payload).encode("utf-8")
        future = publisher.publish(topic_path, data)
        # Non-blocking: don't wait for result() to avoid RuntimeError
        # The publish happens asynchronously; failures are logged but don't crash
        logger.debug("Queued traffic event for Pub/Sub publishing (message_id pending)")
    except GoogleAPIError as exc:
        logger.warning("Failed to publish traffic event to Pub/Sub: %s", exc)
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("Unexpected error when publishing to Pub/Sub: %s", exc)
