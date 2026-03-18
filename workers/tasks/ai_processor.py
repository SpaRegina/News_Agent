import httpx
from typing import List, Dict

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

def summarize_with_ai(
    articles: List[Dict],
    api_key: str,
    model: str,
    system_prompt: str = "",
    user_prompt: str = "",
) -> str:
    """
    Отправляет новости на обработку через OpenRouter.
    Возвращает готовый дайджест в виде строки.
    """
    if not articles:
        return ""

    articles_text = "\n\n".join(
        [f"Заголовок: {a['title']}\nСсылка: {a['url']}\nОписание: {a['summary']}" for a in articles]
    )

    default_system = (
        "Ты — ассистент для составления новостного дайджеста. "
        "Сформируй краткий, читаемый дайджест из предоставленных новостей. "
        "Для каждой новости: заголовок, краткое описание и ссылка. "
        "Пиши на русском языке."
    )

    default_user = (
        f"Составь дайджест из следующих новостей:\n\n{articles_text}"
    )

    messages = [
        {"role": "system", "content": system_prompt or default_system},
        {"role": "user", "content": (user_prompt + "\n\n" + articles_text) if user_prompt else default_user},
    ]

    try:
        response = httpx.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://news-monitor-agent.app",
            },
            json={"model": model, "messages": messages},
            timeout=60,
        )
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Ошибка AI обработки: {str(e)}"


def format_digest_plain(articles: List[Dict]) -> str:
    """Простое форматирование дайджеста без ИИ."""
    lines = ["📰 Новостной дайджест\n"]
    for a in articles:
        lines.append(f"🔹 {a['title']}")
        if a.get("summary"):
            lines.append(f"   {a['summary'][:200]}...")
        lines.append(f"   🔗 {a['url']}")
        lines.append("")
    return "\n".join(lines)
