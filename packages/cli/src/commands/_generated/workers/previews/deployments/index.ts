import $profile from "./profile.js";
/**
 * deployments command group
 * @generated from apis/overlays/workers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "deployments",
	describe: "Operations for previews.deployments",

	routes: {
		profile: $profile,
	},
});

export default command;
