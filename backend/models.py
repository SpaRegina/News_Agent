from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy import func
import enum

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tasks = relationship("MonitoringTask", back_populates="owner", cascade="all, delete-orphan")


class TaskStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    stopped = "stopped"

class SourceType(str, enum.Enum):
    rss = "rss"
    website = "website"

class DeliveryChannel(str, enum.Enum):
    email = "email"
    telegram = "telegram"
    both = "both"


class MonitoringTask(Base):
    __tablename__ = "monitoring_tasks"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    topic = Column(String, nullable=True)
    keywords = Column(JSON, default=[])          # list of strings
    exclude_keywords = Column(JSON, default=[])   # list of strings
    status = Column(Enum(TaskStatus), default=TaskStatus.paused)
    schedule_interval = Column(String, default="1h")  # e.g. "15m", "1h", "1d"
    cron_expression = Column(String, nullable=True)
    delivery_channel = Column(Enum(DeliveryChannel), default=DeliveryChannel.email)
    email_recipients = Column(JSON, default=[])
    telegram_bot_token = Column(String, nullable=True)
    telegram_chat_id = Column(String, nullable=True)
    openrouter_api_key = Column(String, nullable=True)
    openrouter_model = Column(String, nullable=True)
    ai_system_prompt = Column(Text, nullable=True)
    ai_user_prompt = Column(Text, nullable=True)
    use_ai = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    owner = relationship("User", back_populates="tasks")
    sources = relationship("NewsSource", back_populates="task", cascade="all, delete-orphan")
    runs = relationship("TaskRun", back_populates="task", cascade="all, delete-orphan")


class NewsSource(Base):
    __tablename__ = "news_sources"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("monitoring_tasks.id"), nullable=False)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    source_type = Column(Enum(SourceType), default=SourceType.rss)
    is_active = Column(Boolean, default=True)
    task = relationship("MonitoringTask", back_populates="sources")


class RunStatus(str, enum.Enum):
    success = "success"
    partial = "partial"
    failed = "failed"
    running = "running"

class TaskRun(Base):
    __tablename__ = "task_runs"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("monitoring_tasks.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(RunStatus), default=RunStatus.running)
    found_count = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    task = relationship("MonitoringTask", back_populates="runs")
