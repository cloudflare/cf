import $apps from "./apps/index.js";
/**
 * flagship command
 * @generated from apis/overlays/flagship.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "flagship",
	describe: "flagship",

	routes: {
		apps: $apps,
	},
});

export default command;
