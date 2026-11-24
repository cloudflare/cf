import $customtruststore from "./custom-trust-store/index.js";
import $totaltls from "./total-tls/index.js";
/**
 * acm command
 * @generated from apis/overlays/acm.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "acm",
	describe: "acm",

	routes: {
		"custom-trust-store": $customtruststore,
		"total-tls": $totaltls,
	},
});

export default command;
