# 📰 News Monitor Agent

ИИ-агент для автоматического мониторинга, фильтрации и доставки новостей.

## 🚀 Быстрый старт

### Требования
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

---

### 1. Запуск инфраструктуры (PostgreSQL + Redis)

```bash
docker-compose up -d
```

---

### 2. Backend (FastAPI)

```bash
cd backend

# Скопировать .env
cp .env.example .env
# Отредактировать .env при необходимости

# Создать виртуальное окружение и установить зависимости
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

# Запустить сервер
uvicorn main:app --reload --port 8000
```

API документация доступна по адресу: http://localhost:8000/api/v1/openapi.json  
Swagger UI: http://localhost:8000/docs

---

### 3. Workers (Celery)

```bash
cd workers

pip install -r requirements.txt

# Запустить воркер (в отдельном терминале из папки проекта)
celery -A workers.celery_app worker --loglevel=info
```

---

### 4. Frontend (Next.js)

```bash
cd frontend

# Установить зависимости
npm install

# Скопировать .env
cp .env.local.example .env.local

# Запустить dev сервер
npm run dev
```

Приложение доступно по адресу: http://localhost:3000

---

## 🏗 Структура проекта

```
News_Agent/
├── backend/           # FastAPI приложение
│   ├── main.py        # Точка входа
│   ├── models.py      # SQLAlchemy модели
│   ├── schemas.py     # Pydantic схемы
│   ├── database.py    # Подключение к БД
│   ├── core/
│   │   ├── config.py  # Настройки
│   │   └── security.py# JWT и пароли
│   └── api/
│       ├── auth.py    # Авторизация
│       └── tasks.py   # CRUD задач
│
├── workers/           # Celery воркеры
│   ├── celery_app.py  # Конфигурация Celery
│   └── tasks/
│       ├── parser.py       # RSS и HTML парсер
│       ├── ai_processor.py # OpenRouter ИИ
│       ├── delivery.py     # Email + Telegram
│       └── pipeline.py     # Основной pipeline
│
├── frontend/          # Next.js приложение (русский UI)
│   └── src/
│       ├── app/
│       │   ├── login/      # Авторизация
│       │   └── dashboard/  # Дашборд, задачи, история
│       └── lib/
│           └── api.ts      # API клиент
│
└── docker-compose.yml # PostgreSQL + Redis
```

## 🔧 Настройка Email (Gmail)

1. Включить двухфакторную аутентификацию в Google
2. Создать App Password: myaccount.google.com → Безопасность → Пароли приложений
3. Указать в `.env`: `SMTP_USER=ваш@gmail.com`, `SMTP_PASSWORD=пароль_приложения`

## 🤖 OpenRouter ИИ

1. Зарегистрироваться на [openrouter.ai](https://openrouter.ai)
2. Получить API ключ
3. Указать ключ и модель при создании задачи в интерфейсе

## Автоматический запуск (Windows)

Вы можете запустить все сервисы проекта одной командой:

```bat
run.bat
```

Что `run.bat` запускает в отдельных окнах терминала:
- Инфраструктуру Docker (`docker compose up -d`)
- Backend (`uvicorn main:app --reload --port 8000`)
- Celery worker (`python -m celery -A workers.celery_app worker --loglevel=info`)
- Frontend (`npm run dev`)

Предварительные требования:
- Docker Desktop установлен и запущен
- Виртуальное окружение Python уже создано в `backend\\venv`
- Зависимости frontend установлены в `frontend` (`npm install`)
