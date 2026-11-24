import $list from "./list.js";
/**
 * associations command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "associations",
	describe: "Operations for mtls-certificates.associations",

	routes: {
		list: $list,
	},
});

export default command;
