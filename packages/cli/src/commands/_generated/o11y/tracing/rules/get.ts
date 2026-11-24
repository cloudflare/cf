/**
 * get command
 * @generated from apis/overlays/o11y.ts
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
	describe: "View zone trace rules",
	usage:
		"$0 o11y tracing rules get\n\nRetrieve the ordered sampling overrides for a zone's managed Cloudflare Traces ruleset.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
