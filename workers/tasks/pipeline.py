from workers.celery_app import celery_app
from database import SessionLocal
import models
from workers.tasks.parser import parse_rss, parse_webpage, deduplicate, filter_by_keywords
from workers.tasks.ai_processor import summarize_with_ai, format_digest_plain
from workers.tasks.delivery import send_email, send_telegram
from datetime import datetime

@celery_app.task(name="workers.tasks.pipeline.run_task")
def run_task(task_id: int):
    db = SessionLocal()
    try:
        task = db.query(models.MonitoringTask).filter(models.MonitoringTask.id == task_id).first()
        if not task:
            return

        # Создаём запись о запуске
        run = models.TaskRun(task_id=task_id, status=models.RunStatus.running)
        db.add(run)
        db.commit()

        seen_urls = set()
        all_articles = []

        # 1. Парсинг источников
        for source in task.sources:
            if not source.is_active:
                continue
            if source.source_type == models.SourceType.rss:
                articles = parse_rss(source.url)
            else:
                articles = parse_webpage(source.url)
            new_articles = deduplicate(articles, seen_urls)
            all_articles.extend(new_articles)

        # 2. Фильтрация по ключевым словам
        filtered = filter_by_keywords(all_articles, task.keywords or [], task.exclude_keywords or [])

        # 3. ИИ обработка или простое форматирование
        if task.use_ai and task.openrouter_api_key and filtered:
            digest = summarize_with_ai(
                filtered,
                task.openrouter_api_key,
                task.openrouter_model or "openai/gpt-3.5-turbo",
                task.ai_system_prompt or "",
                task.ai_user_prompt or "",
            )
        else:
            digest = format_digest_plain(filtered)

        # 4. Доставка
        sent = 0
        subject = f"📰 Дайджест: {task.name}"
        if task.delivery_channel in [models.DeliveryChannel.email, models.DeliveryChannel.both]:
            ok = send_email(task.email_recipients or [], subject, digest)
            if ok:
                sent += 1
        if task.delivery_channel in [models.DeliveryChannel.telegram, models.DeliveryChannel.both]:
            ok = send_telegram(task.telegram_bot_token or "", task.telegram_chat_id or "", digest)
            if ok:
                sent += 1

        # 5. Обновляем статус
        run.status = models.RunStatus.success
        run.found_count = len(all_articles)
        run.sent_count = len(filtered)
        run.finished_at = datetime.utcnow()
        task.last_run_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        if 'run' in locals():
            run.status = models.RunStatus.failed
            run.error_message = str(e)
            run.finished_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()
