import $edit from "./edit.js";
import $get from "./get.js";
/**
 * tiered-caching command group
 * @generated from apis/overlays/argo.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tiered-caching",
	describe:
		"Reduce origin load by having upper-tier data centers serve cache misses before reaching your origin",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
