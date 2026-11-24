import $generate from "./generate.js";
/**
 * credentials command group
 * @generated from apis/overlays/containers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "credentials",
	describe: "Generate image registry credentials",

	routes: {
		generate: $generate,
	},
});

export default command;
