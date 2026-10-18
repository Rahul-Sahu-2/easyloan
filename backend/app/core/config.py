from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "EasyLoan"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Automatically load environment variables from the root .env file
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()
