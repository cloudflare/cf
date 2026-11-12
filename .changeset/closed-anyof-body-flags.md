---
"cf": patch
---

Generate flags for request bodies that are an `anyOf` of closed objects

A JSON request body that is an `anyOf` got only `--body`. When every alternative is an object that doesn't allow other keys, its fields now get flags, with conflicts and implies inferred as for a `oneOf` body, because such a body can only match the alternatives that have all of its fields. A body with an open alternative still takes only `--body`.

`cf cache purge`, `cf cache invalidate`, their environment variants, `cf magic-transit pcaps create`, and `cf browser-run crawl create` gain field flags. `cf cloudforce-one priority-intelligence profile update` keeps its flags, including `--organization-profile`, now that its body is an `anyOf`.
