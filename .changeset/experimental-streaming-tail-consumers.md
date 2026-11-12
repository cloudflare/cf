---
"cf": minor
---

Move streaming tail consumers to `experimental.streamingTailConsumers` in `cloudflare.config.ts`

This is a breaking change to the experimental config API from `@cloudflare/config` 0.32.0. A `tailConsumers` entry with `streaming: true` is now an invalid config, so commands such as `cf workers types` fail until it is updated. Move each entry that set `streaming: true` to `experimental.streamingTailConsumers`, without the `streaming` field:

```ts
export default defineConfig({
	worker: {
		tailConsumers: [{ worker: "tail-worker" }],
		experimental: {
			streamingTailConsumers: [{ worker: "streaming-tail-worker" }],
		},
	},
});
```

`cf migrate` now converts Wrangler's `streaming_tail_consumers` to `experimental.streamingTailConsumers`.
