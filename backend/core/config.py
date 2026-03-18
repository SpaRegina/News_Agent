from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "News Monitor Agent API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Режимы работы
    DEBUG: bool = True
    
    # Настройки БД
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "news_user"
    POSTGRES_PASSWORD: str = "news_password"
    POSTGRES_DB: str = "news_db"
    POSTGRES_PORT: str = "5432"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Redis и Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # OpenRouter
    OPENROUTER_API_KEY: str = ""
    DEFAULT_AI_MODEL: str = "openai/gpt-3.5-turbo"
    
    # SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # Настройки безопасности
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE_CHANGE_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
