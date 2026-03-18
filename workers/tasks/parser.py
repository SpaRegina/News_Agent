import httpx
import feedparser
from bs4 import BeautifulSoup
from typing import List, Dict

def parse_rss(url: str) -> List[Dict]:
    """Парсит RSS-ленту и возвращает список статей."""
    feed = feedparser.parse(url)
    articles = []
    for entry in feed.entries:
        articles.append({
            "title": entry.get("title", ""),
            "url": entry.get("link", ""),
            "summary": entry.get("summary", ""),
            "published": str(entry.get("published", "")),
        })
    return articles

def parse_webpage(url: str) -> List[Dict]:
    """Парсит новостную страницу и извлекает заголовки и ссылки."""
    try:
        response = httpx.get(url, timeout=10, follow_redirects=True)
        soup = BeautifulSoup(response.text, "html.parser")
        articles = []
        for tag in soup.find_all(["h2", "h3", "article"]):
            a = tag.find("a", href=True)
            if a:
                href = a["href"]
                if href.startswith("/"):
                    from urllib.parse import urlparse, urljoin
                    href = urljoin(url, href)
                articles.append({
                    "title": a.get_text(strip=True),
                    "url": href,
                    "summary": "",
                    "published": "",
                })
        return articles
    except Exception as e:
        return []

def deduplicate(articles: List[Dict], seen_urls: set) -> List[Dict]:
    """Удаляет дубликаты по URL."""
    result = []
    for a in articles:
        if a["url"] not in seen_urls:
            seen_urls.add(a["url"])
            result.append(a)
    return result

def filter_by_keywords(articles: List[Dict], keywords: List[str], exclude: List[str]) -> List[Dict]:
    """Фильтрует новости по ключевым словам."""
    result = []
    for a in articles:
        text = (a["title"] + " " + a["summary"]).lower()
        if keywords and not any(kw.lower() in text for kw in keywords):
            continue
        if any(kw.lower() in text for kw in exclude):
            continue
        result.append(a)
    return result
