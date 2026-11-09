---
"cf": patch
---

Ignore read-only fields in request validation

Omit server-provided read-only fields from input flags, prompts, and validation messages, even when shared request/response schemas mark them required. Ignore supplied read-only values during local validation while preserving checks for writable fields.

Preserve read-only annotations for nested properties and array or tuple items split across sibling `allOf` clauses without applying annotations from unrelated parent fields or tuple positions. Merge read-only annotations for duplicated intersection fields by wire name and retain both schemas of duplicated object fields so generated flags, requirements, and request constants omit response-only fields regardless of member order.

Omit read-only multipart fields from form flags and required-body checks, and select a writable field for file uploads.

Send an empty JSON body automatically when its only properties are read-only, including referenced and intersected schemas.

Skip flags introduced only by conditions on read-only fields so offered inputs agree with request validation.

Preserve sibling read-only annotations inside map values without applying map annotations to explicitly named properties.
