---
"cf": patch
---

Preserve alternative-specific requirements in generated body flags

Keep nested fields with the same name distinct when deriving `oneOf` constraints. Workers VPC service flags now require only the tunnel for the selected host alternative and accept dual-stack IPv4 and IPv6 hosts.

Reject incompatible flag combinations only when no alternative supports them and the variants declare required fields. Keep all-optional configuration updates compatible with cleanup payloads that combine settings from different alternatives.
