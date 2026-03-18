import sys
import os

# Добавляем папку backend в путь Python, чтобы импортировать core, models, database
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from celery import Celery
from core.config import settings

celery_app = Celery(
    "news_monitor",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["workers.tasks.pipeline"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    task_track_started=True,
)
