---
"cf": patch
---

Allow more time for large binary uploads

Scale the API request timeout with the size of binary and multipart bodies so
large R2 objects can finish uploading. Report an actionable timeout error when
the SDK aborts a request.
