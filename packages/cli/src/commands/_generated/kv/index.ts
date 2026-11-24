import $keys from "./keys/index.js";
import $metadata from "./metadata/index.js";
import $namespaces from "./namespaces/index.js";
/**
 * kv command
 * @generated from apis/overlays/kv.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "kv",
	describe: "kv",

	routes: {
		keys: $keys,
		metadata: $metadata,
		namespaces: $namespaces,
	},
});

export default command;
