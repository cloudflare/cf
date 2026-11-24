import $dmarcreports from "./dmarc-reports/index.js";
import $spf from "./spf/index.js";
/**
 * email-auth command
 * @generated from apis/overlays/email-auth.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "email-auth",
	describe: "email-auth",

	routes: {
		"dmarc-reports": $dmarcreports,
		spf: $spf,
	},
});

export default command;
