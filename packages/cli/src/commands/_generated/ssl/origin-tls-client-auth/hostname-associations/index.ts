import $list from "./list.js";
/**
 * hostname-associations command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hostname-associations",
	describe: "Operations for origin-tls-client-auth.hostname-associations",

	routes: {
		list: $list,
	},
});

export default command;
