from sqlmodel import Session

from app.db import engine, init_db
from app.models import AgeLevel, GenerationMode, Plan, PromptTemplate
from app.prompts import MODEL_BY_MODE, build_prompt


def seed() -> None:
    init_db()
    plans = [
        Plan(code="free", name="Free", monthly_price_cents=0, daily_limit=1),
        Plan(code="premium", name="Premium", monthly_price_cents=49900, daily_limit=None),
        Plan(code="premium_plus", name="Premium+", monthly_price_cents=89900, daily_limit=None),
    ]

    with Session(engine) as session:
        for plan in plans:
            session.merge(plan)
        for mode in GenerationMode:
            for age_level in AgeLevel:
                session.add(
                    PromptTemplate(
                        mode=mode,
                        age_level=age_level,
                        story=None,
                        model_name=MODEL_BY_MODE[mode],
                        prompt=build_prompt(mode, age_level),
                    )
                )
        session.commit()


if __name__ == "__main__":
    seed()
