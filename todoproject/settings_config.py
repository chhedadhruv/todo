from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # Django settings
    DEBUG: bool = False
    SECRET_KEY: str
    ALLOWED_HOSTS: str
    CSRF_TRUSTED_ORIGINS: str
    CORS_ORIGIN_WHITELIST: str
    
    # Database settings
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str = 'localhost'
    DB_PORT: str = ''
    
    # Email settings
    EMAIL_BACKEND: str = 'django.core.mail.backends.console.EmailBackend'
    EMAIL_HOST: str = 'smtp.gmail.com'
    EMAIL_PORT: int = 587
    EMAIL_USE_TLS: bool = True
    EMAIL_HOST_USER: str
    EMAIL_HOST_PASSWORD: str
    
    # Security settings
    SECURE_SSL_REDIRECT: bool = True
    SESSION_COOKIE_SECURE: bool = True
    CSRF_COOKIE_SECURE: bool = True
    SECURE_BROWSER_XSS_FILTER: bool = True
    SECURE_CONTENT_TYPE_NOSNIFF: bool = True
    X_FRAME_OPTIONS: str = 'DENY'
    SECURE_HSTS_SECONDS: int = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS: bool = True
    SECURE_HSTS_PRELOAD: bool = True
    SECURE_PROXY_SSL_HEADER_NAME: str = "HTTP_X_FORWARDED_PROTO"
    SECURE_PROXY_SSL_HEADER_VALUE: str = "https"
    
    # Authentication settings
    LOGIN_REDIRECT_URL: str = 'todo_list'
    LOGOUT_REDIRECT_URL: str = 'login'
    LOGIN_URL: str = 'login'
    
    @property
    def allowed_hosts(self) -> List[str]:
        return [host.strip() for host in self.ALLOWED_HOSTS.split(',')]
    
    @property
    def csrf_trusted_origins(self) -> List[str]:
        return [origin.strip() for origin in self.CSRF_TRUSTED_ORIGINS.split(',')]
    
    @property
    def cors_origin_whitelist(self) -> List[str]:
        if not self.CORS_ORIGIN_WHITELIST:
            return []
        return [origin.strip() for origin in self.CORS_ORIGIN_WHITELIST.split(',')]
    
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings() 