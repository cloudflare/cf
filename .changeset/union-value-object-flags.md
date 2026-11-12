---
"cf": patch
---

Generate flags for both shapes of a union request field

When the alternatives of a `oneOf` request body declare a property as a value in one and an object in another, cf kept flags for only the first. Both now get flags: the value takes the property's own flag, the object's fields keep theirs, and the flags of the two sides conflict. Flag names come only from field paths, so they don't depend on the order of the alternatives.

Custom Priority Intelligence Requirement definitions can now be built without `--body`, using `--definition-question` and `--definition-title` with `--definition-mode custom`.
