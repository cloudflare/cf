---
"cf": minor
---

Add `cf speedtest` to measure your connection's speed to Cloudflare

Measure download and upload speed, latency, and jitter against
speed.cloudflare.com with `cf speedtest` or its alias `cf speed-test`. In a
terminal, each reading updates live with a sparkline of its samples; the results
print as JSON along with the Cloudflare data center that served the test.
It follows the method of the speed.cloudflare.com browser test, without packet
loss, and needs no Cloudflare login. Root commands can now declare aliases.
