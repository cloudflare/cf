/**
 * edit command
 * @generated from apis/overlays/email-auth.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief: "Enable or disable DMARC reports for this zone",
			optional: true,
		},
		"skip-wizard": {
			kind: "boolean",
			brief: "Skip the DMARC setup wizard",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for PATCH /dmarc-reports",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Configure DMARC Reports",
	usage:
		"$0 email-auth dmarc-reports edit\n\nUpdates the DMARC report configuration for a zone. At least one of `enabled` or `skip_wizard` must be provided. When enabling, the handler will ensure the DMARC RUA record exists in DNS.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
