import $create from "./create.js";
/**
 * publish command group
 * @generated from apis/overlays/zaraz.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "publish",
	describe:
		"Publish pending Zaraz configuration changes to make them live on the zone",

	routes: {
		create: $create,
	},
});

export default command;
