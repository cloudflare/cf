import $create from "./create.js";
/**
 * jobs command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "jobs",
	describe: "Operations for casb.webhooks.jobs",

	routes: {
		create: $create,
	},
});

export default command;
