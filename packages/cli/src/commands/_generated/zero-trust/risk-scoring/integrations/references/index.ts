import $get from "./get.js";
/**
 * references command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "references",
	describe: "User Risk Scoring - retrieve integrations by external reference",

	routes: {
		get: $get,
	},
});

export default command;
