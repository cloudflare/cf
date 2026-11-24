/**
 * update command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Name of the bucket.",
			parse: String,
		},
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
			optional: true,
			parse: String,
		},
		ciphers: {
			kind: "parsed",
			brief:
				"An allowlist of ciphers for TLS termination. These ciphers must be in the BoringSSL format.",
			variadic: true,
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether to enable public bucket access at the specified custom domain.",
			optional: true,
		},
		"min-tls": {
			kind: "parsed",
			brief:
				"Minimum TLS Version the custom domain will accept for incoming connections. If not set, defaults to previous value.",
			optional: true,
			choices: ["1.0", "1.1", "1.2", "1.3"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "min-tls", "text"),
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
	operands: [
		{
			placeholder: "domain",
			brief: "Name of the custom domain.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <domain>",
	describe: "Configure Custom Domain Settings",
	usage:
		"$0 r2 buckets domains custom update <domain>\n\nEdit the configuration for a custom domain on an existing R2 bucket.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
