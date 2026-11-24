/**
 * list command
 * @generated from apis/overlays/dls.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cursor: {
			kind: "parsed",
			brief:
				"Opaque token for cursor-based pagination. Omit for the first page. Pass the value from a previous response to fetch the next page.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
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
	command: "list",
	describe: "List DLS prefix bindings for an account",
	usage:
		"$0 dls regional-services prefix-bindings list\n\nList the BYOIP prefix bindings configured for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
