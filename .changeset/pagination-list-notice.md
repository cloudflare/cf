---
"cf": patch
---

Warn when a paginated list omits later results

Print a stderr notice when an unfiltered page-number list response reports
additional pages, while keeping JSON stdout unchanged. Suppress the notice
when other query values might filter the API's reported total.
