import $keys from "./keys/index.js";
import $liveinputs from "./live-inputs/index.js";
import $storageusage from "./storage-usage.js";
import $videos from "./videos/index.js";
import $watermarks from "./watermarks/index.js";
import $webhooks from "./webhooks/index.js";
/**
 * stream command
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "stream",
	describe:
		"Video encoding, storage, and delivery — upload, live-stream, clip, caption, and embed video at scale",

	routes: {
		"storage-usage": $storageusage,
		keys: $keys,
		"live-inputs": $liveinputs,
		videos: $videos,
		watermarks: $watermarks,
		webhooks: $webhooks,
	},
});

export default command;
