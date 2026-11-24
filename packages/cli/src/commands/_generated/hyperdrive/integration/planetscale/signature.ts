/**
 * signature command
 * @generated from apis/overlays/hyperdrive.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
	command: "signature",
	describe: "Create Database Signature",
	usage:
		"$0 hyperdrive integration planetscale signature\n\nReturns a short-lived signed authorization for creating a database that is billed through Cloudflare. The caller passes these values to the integration partner's own CLI, which verifies the signature before creating the database. Requires the account to be entitled to Cloudflare-billed databases for the integration.",
	...parameters,
	loader: () => import("./signature.handler.js"),
});

export default command;
