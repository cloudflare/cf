import $assets from "./assets/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $public from "./public/index.js";
/**
 * finetunes command group
 * @generated from apis/overlays/ai.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "finetunes",
	describe: "Operations for finetunes",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
		assets: $assets,
		public: $public,
	},
});

export default command;
