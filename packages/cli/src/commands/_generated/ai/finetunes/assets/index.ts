import $create from "./create.js";
import $download from "./download.js";
/**
 * assets command group
 * @generated from apis/overlays/ai.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "assets",
	describe: "Operations for finetunes.assets",

	routes: {
		create: $create,
		download: $download,
	},
});

export default command;
