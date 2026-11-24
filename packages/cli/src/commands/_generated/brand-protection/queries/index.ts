import $dismiss from "./dismiss.js";
import $get from "./get.js";
import $undismiss from "./undismiss.js";
/**
 * queries command group
 * @generated from apis/overlays/brand-protection.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "queries",
	describe: "Operations for queries",

	routes: {
		dismiss: $dismiss,
		get: $get,
		undismiss: $undismiss,
	},
});

export default command;
