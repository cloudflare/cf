/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
	describe: "Get active region",
	usage:
		"$0 zero-trust region get\n\nGets the region that the account is using for Cloudflare One. `region_key` is `null` if the account has not selected a region.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
