import $get from "./get.js";
/**
 * metadata command group
 * @generated from apis/overlays/kv.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "metadata",
	describe: "Operations for metadata",

	routes: {
		get: $get,
	},
});

export default command;
