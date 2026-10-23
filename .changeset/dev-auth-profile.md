---
"cf": patch
---

Forward the selected authentication profile to development servers

Framework commands and Cloudflare delegates now receive the same cf authentication context. Explicit profiles override directory bindings in the development server without passing credentials through command arguments.
