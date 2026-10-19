from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "EasyLoan"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # ---- NEW: JWT settings ----
    SECRET_KEY: str                          # no default on purpose: app must not start without it
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Automatically load environment variables from the root .env file
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()

