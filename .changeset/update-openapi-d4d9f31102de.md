---
"cf": minor
---

Update the generated command surface for Forge OpenAPI release
`d4d9f31102dedfa2249f5a9e8ead7e41f5daa83b`.

This prerelease includes breaking command renames without aliases. Update scripts
from `cf workers secrets bulk` to `cf workers secrets bulk-edit` and from
`cf workers-for-platforms dispatch-namespaces scripts secrets bulk` to
`cf workers-for-platforms dispatch-namespaces scripts secrets bulk-edit`. The
`cf email-security` subgroups `allow-policies`, `block-senders`, `content-policies`,
`domains`, `trusted-domains`, and `url-ignore-patterns` rename `batch` to
`bulk-apply`.

Add `--multiprovider-enabled` to `cf ai-gateway gateways create` and `update`.
Add `--forward-client-ip-headers` to `cf google-tag-gateway config update` and
make `--hide-original-ip` optional and deprecated; it no longer affects traffic.
