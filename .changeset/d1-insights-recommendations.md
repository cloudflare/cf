---
"cf": minor
---

Add D1 Insights index recommendations and settings commands

Use `cf d1 insights recommendations` to retrieve index recommendations and
`cf d1 insights settings get` or `cf d1 insights settings update` to view or
change the account's AI setting. Use `cf d1 list --fields` to select returned
database fields, including the opt-in `recommendation_count` field.
