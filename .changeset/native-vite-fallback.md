---
"cf": minor
---

Run Vite and Vite+ commands selected by autoconfig

Stop requiring the experimental internal `cf-vite` executable from `@cloudflare/vite-plugin`. Autoconfig selects the project's installed Vite or Vite+ executable for dev, build, and workflows that build before deploying, including projects without a detected framework command. cf executes the returned commands with argument forwarding, plugin compatibility checks, and Preview context, while preserving Pages and unsupported project setup guards. Require `@cloudflare/vite-plugin >=2.0.0-rc.0 <3` for Build Output v1, rejecting older betas before starting their commands. Support framework dependencies installed in the application or hoisted within its workspace. Recognize an existing Cloudflare configuration before dependencies are installed, and provide install guidance when a development or build command cannot run. Let Vite evaluate dynamic configurations and custom config files, and suggest checking `cloudflare()` when a successful Vite build produces no Build Output. Keep the Vite plugin's binding defaults unchanged. To explicitly disable remote bindings, set `remoteBindings: false` in the plugin configuration; the internal delegate's `--local` flag is no longer available.

Forward shutdown signals to the command tree, force termination on a repeated interrupt, and attempt synchronous cleanup when cf exits before its command. Preserve graceful shutdown through global-to-local cf delegation by avoiding duplicate terminal interrupts. On POSIX, also forward SIGHUP when the terminal closes. Cleanup cannot run when cf itself receives SIGKILL.
