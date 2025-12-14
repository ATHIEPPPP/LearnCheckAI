from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = ConfigDict(extra='allow')  # Pydantic v2 style
    
    # Database settings
    DB_USER: str = Field(default="learncheck_user")
    DB_PASSWORD: str = Field(default="learncheck_pwd")
    DB_HOST: str = Field(default="localhost")
    DB_PORT: str = Field(default="5432")
    DB_NAME: str = Field(default="learncheck_db")
    
    # Gemini API
    GOOGLE_GEMINI_API_KEY: Optional[str] = Field(default=None)

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.DB_USER}:"
            f"{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

settings = Settings()
