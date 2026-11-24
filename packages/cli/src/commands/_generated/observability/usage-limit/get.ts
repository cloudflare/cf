/**
 * get command
 * @generated from apis/overlays/observability.ts
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
	describe: "Get usage limit status",
	usage:
		"$0 observability usage-limit get\n\nWhether Workers Observability is keeping fewer of the account's events, because it passed its daily limit or for another reason, and what that limit is. Daily limits reset at 00:00 UTC; paid accounts are brought back in stages over the following hours.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
