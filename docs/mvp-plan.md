# MVP Plan

## Milestone 1: Core Generation

- Upload validation for JPEG, PNG and WEBP up to 20 MB.
- Free mode with clean coloring-page prompt.
- PNG result and A4 PDF result.
- Generation status polling.

## Milestone 2: Monetization

- Free quota: one classic generation.
- Premium plan unlocks cartoon mode.
- Premium+ unlocks story mode.
- Payment provider integration and subscription state.

## Milestone 3: Telegram

- `/start`
- Create coloring page
- My works
- Buy Premium
- Support

## Milestone 4: Admin

- User and generation stats.
- Conversion and sales stats.
- Error logs.
- Plan management.
- Prompt management.

## Production Notes

- Put API, worker, Redis and Postgres in the same region as S3 storage.
- Use webhook-based Telegram delivery in production.
- Add moderation and abuse limits before public launch.
- Move public file delivery behind signed URLs or CDN rules.
