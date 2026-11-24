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
		namespace: {
			kind: "parsed",
			brief: "Artifacts namespace name.",
			parse: String,
		},
		name: { kind: "parsed", brief: "Repository name.", parse: String },
		state: {
			kind: "enum",
			brief: "State",
			values: ["active", "expired", "revoked", "all"],
			optional: true,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
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
	describe: "List repository tokens",
	usage:
		"$0 artifacts namespaces repos tokens list\n\nLists tokens for a repository.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
