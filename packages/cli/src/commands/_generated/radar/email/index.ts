import $routing from "./routing/index.js";
import $security from "./security/index.js";
/**
 * email command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "email",
	describe:
		"Email security trends — DMARC/SPF/DKIM adoption, spam, and phishing statistics",

	routes: {
		routing: $routing,
		security: $security,
	},
});

export default command;
