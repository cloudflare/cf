/**
 * list command
 * @generated from apis/overlays/artifacts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		cursor: { kind: "parsed", brief: "Cursor", optional: true, parse: String },
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
	describe: "List namespaces",
	usage:
		"$0 artifacts namespaces list\n\nLists Artifacts namespaces for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
