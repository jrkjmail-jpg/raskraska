import asyncio
import sys
from pathlib import Path

api_dir = Path(__file__).parent / "apps" / "api"
sys.path.insert(0, str(api_dir))

from app.telegram_bot import run_bot


if __name__ == "__main__":
    asyncio.run(run_bot())
