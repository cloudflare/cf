import $hostnameassociations from "./hostname-associations/index.js";
/**
 * certificate-authorities command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "certificate-authorities",
	describe: "Operations for certificate-authorities",

	routes: {
		"hostname-associations": $hostnameassociations,
	},
});

export default command;
