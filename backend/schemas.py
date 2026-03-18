from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import TaskStatus, SourceType, DeliveryChannel, RunStatus

# ─── USER SCHEMAS ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ─── SOURCE SCHEMAS ──────────────────────────────────────────────────────────

class SourceCreate(BaseModel):
    name: str
    url: str
    source_type: SourceType = SourceType.rss

class SourceOut(SourceCreate):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

# ─── TASK SCHEMAS ────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    topic: Optional[str] = None
    keywords: List[str] = []
    exclude_keywords: List[str] = []
    schedule_interval: str = "1h"
    cron_expression: Optional[str] = None
    delivery_channel: DeliveryChannel = DeliveryChannel.email
    email_recipients: List[str] = []
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    openrouter_model: Optional[str] = None
    ai_system_prompt: Optional[str] = None
    ai_user_prompt: Optional[str] = None
    use_ai: bool = False
    sources: List[SourceCreate] = []

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    topic: Optional[str] = None
    keywords: Optional[List[str]] = None
    exclude_keywords: Optional[List[str]] = None
    schedule_interval: Optional[str] = None
    cron_expression: Optional[str] = None
    delivery_channel: Optional[DeliveryChannel] = None
    email_recipients: Optional[List[str]] = None
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    openrouter_model: Optional[str] = None
    ai_system_prompt: Optional[str] = None
    ai_user_prompt: Optional[str] = None
    use_ai: Optional[bool] = None

class TaskOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    topic: Optional[str]
    keywords: List[str]
    exclude_keywords: List[str]
    status: TaskStatus
    schedule_interval: str
    cron_expression: Optional[str]
    delivery_channel: DeliveryChannel
    email_recipients: List[str]
    telegram_chat_id: Optional[str]
    use_ai: bool
    created_at: datetime
    updated_at: Optional[datetime]
    last_run_at: Optional[datetime]
    sources: List[SourceOut] = []
    class Config:
        from_attributes = True

# ─── RUN SCHEMAS ─────────────────────────────────────────────────────────────

class TaskRunOut(BaseModel):
    id: int
    task_id: int
    started_at: datetime
    finished_at: Optional[datetime]
    status: RunStatus
    found_count: int
    sent_count: int
    error_message: Optional[str]
    class Config:
        from_attributes = True
