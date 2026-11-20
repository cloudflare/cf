---
"cf": minor
---

Add `--secrets-file` to `cf previews deploy`

Use `cf previews deploy --secrets-file .env.preview` to upload secrets with a Preview deployment, in the same JSON or `.env` format that `cf deploy --secrets-file` accepts. Previously, Preview secrets could only be set in the Cloudflare dashboard or with Wrangler.
