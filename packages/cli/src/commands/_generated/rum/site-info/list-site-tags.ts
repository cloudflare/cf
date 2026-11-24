/**
 * list-site-tags command
 * @generated from apis/overlays/rum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		all: {
			kind: "boolean",
			brief: "When true, includes sites that are disabled or paused.",
			optional: true,
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
	command: "list-site-tags",
	describe: "List Web Analytics site tags",
	usage:
		"$0 rum site-info list-site-tags\n\nReturns all site tags for an account as an array of site tag strings. This endpoint returns all results without pagination.",
	...parameters,
	loader: () => import("./list-site-tags.handler.js"),
});

export default command;
