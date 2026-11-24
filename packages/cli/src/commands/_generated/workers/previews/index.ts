import $deployments from "./deployments/index.js";
/**
 * previews command group
 * @generated from apis/overlays/workers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "previews",
	describe: "Operations for previews",

	routes: {
		deployments: $deployments,
	},
});

export default command;
