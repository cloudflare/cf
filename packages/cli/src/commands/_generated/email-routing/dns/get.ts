/**
 * get command
 * @generated from apis/overlays/email-routing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		subdomain: {
			kind: "parsed",
			brief:
				"Deprecated. When supplied, the response shape differs from the documented default and is not modeled in generated SDKs. Do not rely on this parameter.",
			optional: true,
			parse: String,
		},
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
	describe: "Email Routing - DNS settings",
	usage:
		"$0 email-routing dns get\n\nShow the DNS records needed to configure your Email Routing zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
