---
"cf": patch
---

Remove the fixed timeout from binary uploads

Allow binary and multipart uploads to finish without a CLI-imposed request
deadline, so large R2 objects are not aborted after 30 seconds. Keep the
standard timeout for other API calls and report SDK timeouts clearly.
