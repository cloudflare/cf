---
"cf": patch
---

Show why a request failed without a response

A request that can't reach the API now names the cause, such as a DNS, TLS
or connection error, after `fetch failed`, and a request that times out
reports `Timeout exceeded when calling <method> <path>.` instead of
`"timeout"`.
