import $get from "./get.js";
/**
 * recommendations command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "recommendations",
	describe:
		"Get the recommended SSL/TLS encryption mode based on your origin server's certificate configuration",

	routes: {
		get: $get,
	},
});

export default command;
