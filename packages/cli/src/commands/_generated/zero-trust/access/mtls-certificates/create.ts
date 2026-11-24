/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"associated-hostnames": {
			kind: "parsed",
			brief:
				"The hostnames of the applications that will use this certificate.",
			variadic: true,
			optional: true,
			parse: String,
		},
		certificate: {
			kind: "parsed",
			brief: "The certificate content.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the certificate.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Add an mTLS certificate",
	usage:
		"$0 zero-trust access mtls-certificates create\n\nAdds a new mTLS root certificate to Access.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
