from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    # Sesuaikan dengan docker-compose tadi
    DB_USER: str = Field(default="learncheck")
    DB_PASSWORD: str = Field(default="learncheck_pass")
    DB_HOST: str = Field(default="localhost")
    DB_PORT: str = Field(default="5432")
    DB_NAME: str = Field(default="learncheck_db")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.DB_USER}:"
            f"{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
