---
"cf": patch
---

Fix JSON string highlighting for escaped quotation marks

Keep the complete string value highlighted when JSON contains escaped quotes
or backslashes. Non-interactive output remains plain, parseable JSON.
