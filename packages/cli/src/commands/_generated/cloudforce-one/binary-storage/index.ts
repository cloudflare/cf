import $create from "./create.js";
import $get from "./get.js";
/**
 * binary-storage command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "binary-storage",
	describe:
		"Upload and retrieve malware samples and suspicious binaries for analysis",

	routes: {
		create: $create,
		get: $get,
	},
});

export default command;
