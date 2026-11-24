/**
 * get command
 * @generated from apis/overlays/cps.ts
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
	command: "get",
	describe: "Get communication preferences",
	usage:
		"$0 cps get\n\nRetrieve the communication preferences for the authenticated user, including email verification status, marketing subscription opt-in/opt-out state, and language locale. Callers authenticate with standard Cloudflare API tokens or keys.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
