---
"cf": patch
---

Align command metadata defaults with CLI behavior

Only advertise defaults that generated commands actually apply, so `cf tools`
does not imply that omitted PATCH or PUT body flags reset existing settings.
Preserve discriminator defaults and omit defaults for conflicting, repeated,
and JSON-valued flags consistently with the command builder.
