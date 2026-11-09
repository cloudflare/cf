---
"cf": minor
---

Run Vite and Vite+ commands selected by autoconfig

Stop requiring the experimental internal `cf-vite` executable from `@cloudflare/vite-plugin`. Autoconfig selects the project's installed Vite or Vite+ executable for dev, build, and workflows that build before deploying, including projects without a detected framework command. cf executes the returned commands with argument forwarding, plugin compatibility checks, and Preview context, while preserving Pages and unsupported project setup guards. Configure `cloudflare({ remoteBindings: false })` instead of passing the removed delegate's `--local` flag.

Forward shutdown signals to the command tree, force termination on a repeated interrupt, and attempt synchronous cleanup when cf exits before its command. On POSIX, also forward SIGHUP when the terminal closes. Cleanup cannot run when cf itself receives SIGKILL.
