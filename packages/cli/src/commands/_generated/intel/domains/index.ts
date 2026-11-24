import $bulks from "./bulks/index.js";
import $get from "./get.js";
/**
 * domains command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "domains",
	describe:
		"Domain intelligence — risk scores, categories, and associated infrastructure",

	routes: {
		get: $get,
		bulks: $bulks,
	},
});

export default command;
