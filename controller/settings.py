from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    NAMESPACE: str = "default"
    TARGET_DEPLOYMENT: str = "autonomous-api-deployment"
    TARGET_SERVICE: str = "autonomous-api-service"
    SCRAPE_INTERVAL_MS: int = 500
    
    class Config:
        env_file = ".env"

settings = Settings()
