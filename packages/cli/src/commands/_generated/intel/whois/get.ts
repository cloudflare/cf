/**
 * get command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		domain: { kind: "parsed", brief: "Domain", optional: true, parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get WHOIS Record",
	usage:
		"$0 intel whois get\n\nRetrieves WHOIS registration data for a domain, including registrant and nameserver information.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
