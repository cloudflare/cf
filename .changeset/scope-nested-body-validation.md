---
"cf": patch
---

Correct generated validation for nested optional request-body objects.

Required fields are now enforced only when their containing object is supplied. This prevents flags in sibling objects from incorrectly requiring one another and keeps defaults from creating absent optional objects.

Raw `--body` requests continue to bypass validation for individual body flags.
