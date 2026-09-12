import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
from app.db.database import init_db, AsyncSessionLocal
from app.db.seed import seed_data
from app.api.routes.complaints import router as complaints_router
from app.api.routes.ai import router as ai_router
from app.api.endpoints import router as legacy_api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("pharma_qms.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Pharma Complaint QMS Backend...")
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_data(session)
    logger.info("Database initialized & seeded successfully.")
    yield
    logger.info("Shutting down Pharma Complaint QMS Backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Enable CORS with configured trusted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Global exception handler to prevent leaking internal stack traces / secrets
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing the request. Details have been logged securely."
        }
    )

# Register AI & Complaints Routers under /api and /api/v1
app.include_router(complaints_router, prefix="/api")
app.include_router(complaints_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(legacy_api_router, prefix="/api/v1")
app.include_router(legacy_api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "models": {
            "primary": settings.PRIMARY_MODEL,
            "optional": settings.OPTIONAL_MODEL
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
