---
"cf": patch
---

Read every numbered page during deployment resource lookups

Fix `cf previews deploy` failing to find a Container's Durable Object namespace
when it appears after the first 1000 namespaces. Deployment helpers now follow
page-number pagination, including for Queue provisioning lookups.
