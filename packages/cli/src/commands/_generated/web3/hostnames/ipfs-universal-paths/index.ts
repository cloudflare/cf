import $contentlists from "./content-lists/index.js";
/**
 * ipfs-universal-paths command group
 * @generated from apis/overlays/web3.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ipfs-universal-paths",
	describe: "Operations for hostnames.ipfs-universal-paths",

	routes: {
		"content-lists": $contentlists,
	},
});

export default command;
