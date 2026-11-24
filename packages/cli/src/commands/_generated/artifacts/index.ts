import $namespaces from "./namespaces/index.js";
/**
 * artifacts command
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "artifacts",
	describe: "artifacts",

	routes: {
		namespaces: $namespaces,
	},
});

export default command;
