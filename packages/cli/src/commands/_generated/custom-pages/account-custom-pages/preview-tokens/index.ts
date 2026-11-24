import $create from "./create.js";
/**
 * preview-tokens command group
 * @generated from apis/overlays/custom-pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "preview-tokens",
	describe: "Preview tokens for account-level custom pages",

	routes: {
		create: $create,
	},
});

export default command;
