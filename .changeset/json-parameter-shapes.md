---
"cf": patch
---

Show shallow JSON shapes in structured parameter descriptions

Include wire field names, value types, enum choices, and optional keys in command help and `cf schema` for JSON array and map flags. Abbreviate nested objects with `{...}` and omitted fields or choices with `...more`, simplify redundant alternatives, and show nullable values only where the flag parser accepts them. Omit read-only response fields from the sketches.
