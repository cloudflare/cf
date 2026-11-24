import $getcomplaints from "./get-complaints.js";
/**
 * reputation command group
 * @generated from apis/overlays/email-sending.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "reputation",
	describe: "Operations for subdomains.reputation",

	routes: {
		"get-complaints": $getcomplaints,
	},
});

export default command;
