try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    from app.api import router
    from app.db import init_db
except ModuleNotFoundError:
    if __name__ == "__main__":
        import asyncio
        import sys
        from pathlib import Path

        sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
        from bot import run_bot

        asyncio.run(run_bot())
    else:
        raise
else:
    app = FastAPI(title="AI Coloring Book Generator API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(router, prefix="/api")
