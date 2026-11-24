import $create from "./create.js";
import $revoke from "./revoke.js";
/**
 * tokens command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tokens",
	describe: "Operations for namespaces.tokens",

	routes: {
		create: $create,
		revoke: $revoke,
	},
});

export default command;
