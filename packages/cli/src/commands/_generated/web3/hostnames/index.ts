import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $ipfsuniversalpaths from "./ipfs-universal-paths/index.js";
import $list from "./list.js";
/**
 * hostnames command group
 * @generated from apis/overlays/web3.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hostnames",
	describe:
		"Web3 gateway hostnames with IPFS Universal Path content list management",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		"ipfs-universal-paths": $ipfsuniversalpaths,
	},
});

export default command;
