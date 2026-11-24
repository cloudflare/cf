import $add from "./add.js";
import $generate from "./generate.js";
import $remove from "./remove.js";
/**
 * tags command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tags",
	describe: "Operations for threat-signals.articles.tags",

	routes: {
		add: $add,
		generate: $generate,
		remove: $remove,
	},
});

export default command;
