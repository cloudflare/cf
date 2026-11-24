import $entries from "./entries/index.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * content-lists command group
 * @generated from apis/overlays/web3.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "content-lists",
	describe: "Operations for hostnames.ipfs-universal-paths.content-lists",

	routes: {
		get: $get,
		update: $update,
		entries: $entries,
	},
});

export default command;
